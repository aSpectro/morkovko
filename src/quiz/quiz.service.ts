import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import { configService } from './../config/config.service';
import { Cron } from '@nestjs/schedule';
import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js';
import { RedisService } from 'nestjs-redis';
import {
  setEmbedAuthor,
  capitalize,
  abbreviateNumber,
} from './../morkovko/commands/helpers';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlayerEntity } from './../entities/player.entity';
import { QuizEntity } from './../entities/quiz.entity';
import { FundEntity } from './../entities/fund.entity';
import { PlayerDTO } from './../dto/player.dto';
import { QuizDTO } from './../dto/quiz.dto';
import { FundDTO } from './../dto/fund.dto';

const mafiaChannelId = configService.getMorkovkoChannel();

@Injectable()
export class QuizService {
  client: any;
  redis: any;
  cooldown = new Set();
  currentQuestion: any;
  currentQuiz: { users: { id: string; points: number }[]; carrots: number };
  constructor(
    @InjectRepository(PlayerEntity)
    private playerRepository: Repository<PlayerEntity>,

    @InjectRepository(QuizEntity)
    private quizRepository: Repository<QuizEntity>,

    @InjectRepository(FundEntity)
    private fundRepository: Repository<FundEntity>,

    private readonly redisService: RedisService,
  ) {}

  setClient(client: any) {
    this.client = client;
  }

  async setRedisClient() {
    this.redis = await this.redisService.getClient();
    await this.redis.flushall('ASYNC');
  }

  // @Cron('10 0 12,16,21 * * *')
  async startPlayQuiz() {
    try {
      const fund: FundDTO = await this.fundRepository.findOne({
        where: {
          isActive: true,
        },
      });

      if (fund) {
        const embed = new EmbedBuilder().setColor('#2f54eb');
        embed.setDescription(
          `На горизонте появилась странная сцена, кажется **Фонд борьбы с моррупцией** начал свою ежедневную викторину.\n
          Размер призового фонда **${abbreviateNumber(fund.fundSize)}** 🥕.\n
          На табличке с правилами написано:\n
          1. Викторина проходит каждый день, в 12:00, 16:00, 21:00 МСК.\n
          2. Размер призового фонда зависит от деятельности молиции и фонда.\n
          3. В викторине 10 вопросов, первый фермер ответивший верно получает 1 балл.\n
          4. По истечению вопросов, игрок, набравший больше всех баллов получает морковки из призового фонда.\n
          5. Если в конце игры игроки с большим числом баллов имеют равно кол-во баллов, то призовой фонд делиться между ними поровну.`,
        );

        this.currentQuiz = {
          users: [],
          carrots: fund.fundSize,
        };

        this.client.channels
          .fetch(mafiaChannelId)
          .then((channel: any) => {
            channel.send({ embeds: [embed] });
            setTimeout(async () => {
              await this.sendQuestion();
            }, 10000);
          })
          .catch(console.error);
      }
    } catch (error) {
      console.log(error);
    }
  }

  // @Cron('0 0 2 * * *')
  async fundRotator() {
    try {
      const fund: FundDTO = await this.fundRepository.findOne({
        where: {
          isActive: true,
        },
      });

      if (!fund) {
        this.createFund({});
      }
    } catch (error) {
      console.log(error);
    }
  }

  async createFund(fund: FundDTO): Promise<{ status: number }> {
    return new Promise(async (resolve, reject) => {
      const fundRow: FundDTO = new FundEntity();
      Object.assign(fundRow, { ...fund });

      try {
        await this.fundRepository.save(this.fundRepository.create(fundRow));
        resolve({ status: 200 });
      } catch (error) {
        resolve({ status: 400 });
      }
    });
  }

  async sendQuestion() {
    const q = await this.quizRepository.findOne({
      where: {
        isUsed: false,
      },
    });

    const send = async (data, id) => {
      const embed = new EmbedBuilder().setColor('#2f54eb');
      embed.setDescription(
        `**Вопрос викторины**\n
        ❓ ${data.label}`,
      );
      embed.setFooter({ text: `${id}/10` });

      const values = data.values.sort(() => 0.5 - Math.random());
      const row = new ActionRowBuilder();
      const fund: FundDTO = await this.fundRepository.findOne({
        where: {
          isActive: true,
        },
      });

      if (fund) {
        values.forEach((v) => {
          row.addComponents(
            new ButtonBuilder()
              .setCustomId(
                `${fund.id}:${v.isRight ? 'right' : 'wrong'}:${v.id}`,
              )
              .setLabel(`${capitalize(v.label)}`)
              .setStyle(ButtonStyle.Primary),
          );
        });

        this.client.channels
          .fetch(mafiaChannelId)
          .then((channel: any) => {
            channel.send({ embeds: [embed], components: [row] });
          })
          .catch(console.error);
      }
    };

    if (q) {
      q.isUsed = true;
      await this.quizRepository.save(q);
      if (this.currentQuestion) {
        if (this.currentQuestion.id < 10) {
          this.currentQuestion.id += 1;
          this.currentQuestion.isActive = true;
          this.currentQuestion.qData = q;
          send(q.questionData, this.currentQuestion.id);
        } else {
          await this.calcWinners();
        }
      } else {
        this.currentQuestion = {
          id: 1,
          isActive: true,
          qData: q,
        };
        send(q.questionData, this.currentQuestion.id);
      }
    } else {
      await this.quizRepository
        .createQueryBuilder()
        .update()
        .set({
          isUsed: false,
        })
        .execute();

      await this.sendQuestion();
    }
  }

  async calcWinners() {
    const a = this.currentQuiz;
    const maxPoints = Math.max(...a.users.map((m) => m.points));
    const embed = new EmbedBuilder().setColor('#52c41a');
    if (maxPoints === 0) {
      embed.setDescription(`К сожалению никто не выиграл в викторине.`);
    } else {
      const winners = a.users.filter((f) => f.points === maxPoints);
      const prize =
        winners.length > 1 ? Math.floor(a.carrots / winners.length) : a.carrots;

      if (winners.length > 1) {
        const winnersMention = winners.map((m) => `<@${m.id}>`).join(' ');
        embed.setDescription(
          `**Встречайте победителей викторины!**\n
          🏆 ${winnersMention} набрали больше всех баллов - **${maxPoints}**!\n
          Их приз: **${abbreviateNumber(prize)}** 🥕 каждому!`,
        );
      } else {
        embed.setDescription(
          `**Встречайте победителя викторины!**\n
          🏆 <@${winners[0].id}> набрал больше всех баллов - **${maxPoints}**!\n
          Его приз: **${abbreviateNumber(prize)}** 🥕!`,
        );
      }

      this.currentQuestion = null;

      winners.forEach(async (w) => {
        try {
          const player: PlayerDTO = await this.playerRepository.findOne({
            where: {
              userId: w.id,
            },
          });
          if (player) {
            player.carrotCount += prize;
            await this.savePlayer(player);
          }
        } catch (error) {
          console.log(error);
        }
      });
    }
    this.client.channels
      .fetch(mafiaChannelId)
      .then(async (channel: any) => {
        channel.send({ embeds: [embed] });
        const fundRes = await this.getActiveFund();
        if (fundRes.status === 200) {
          const fund = fundRes.fund;
          fund.isActive = false;
          await this.saveFund(fund);
          await this.createFund({});
        }
      })
      .catch(console.error);
  }

  async processAnswer(interaction: any) {
    const user = interaction.user;
    const [funId, value, valueId] = interaction.customId.split(':');
    const fund = await this.fundRepository.findOne({
      where: {
        id: funId,
      },
    });

    const setDelay = () => {
      this.cooldown.add(user.id);
      setTimeout(() => {
        this.cooldown.delete(user.id);
      }, 3000);
    };
    if (!fund || (fund && !fund.isActive)) {
      const embed = new EmbedBuilder().setColor('#f5222d');
      embed.setDescription(`Эта викторина уже закончилась!`);
      await interaction
        .update({
          embeds: [embed],
          components: [],
        })
        .catch();
    } else {
      if (this.cooldown.has(user.id)) {
        const embed = new EmbedBuilder().setColor('#f5222d');
        embed.setDescription(`Подожди пару секунд, ты уже отвечал!`);
        await interaction
          .reply({
            embeds: [setEmbedAuthor(embed, user)],
            ephemeral: true,
          })
          .catch();
      } else if (value === 'right' && this.currentQuestion.isActive) {
        const rightValue = this.currentQuestion.qData.questionData.values.find(
          (f) => f.isRight,
        ).label;
        const embed = new EmbedBuilder().setColor('#2f54eb');
        embed.setDescription(
          `❓ ${this.currentQuestion.qData.questionData.label}\n
          <@${user.id}> ответил верно! Правильный ответ: **${capitalize(
            rightValue,
          )}**`,
        );

        const cqUser = this.currentQuiz.users.find((f) => f.id === user.id);
        if (cqUser) {
          cqUser.points += 1;
        } else {
          this.currentQuiz.users.push({ id: user.id, points: 1 });
        }

        await interaction
          .update({
            embeds: [embed],
            components: [],
          })
          .catch();

        this.currentQuestion.isActive = false;
        setTimeout(async () => {
          await this.sendQuestion();
        }, 10000);
      } else {
        const embed = new EmbedBuilder().setColor('#f5222d');
        embed.setDescription(`Неверно, попробуй другой вариант!`);
        await interaction
          .reply({
            embeds: [setEmbedAuthor(embed, user)],
            ephemeral: true,
          })
          .catch();
      }
      setDelay();
    }
  }

  async loadQuestions() {
    try {
      const questions: number = await this.quizRepository.count();
      if (questions > 0) {
        console.log('Quiz questions loaded, count: ', questions);
      } else {
        fs.readFile('quiz.txt', (err, data) => {
          if (err) throw err;
          let array: any = data.toString().split('\n');
          array = array.map((m) => {
            const [question, answer] = m.split('*');
            const obj = {
              label: question,
              values: [
                {
                  label: answer.replace('\r', ''),
                  isRight: true,
                },
              ],
            };
            return obj;
          });
          const answers = JSON.parse(JSON.stringify(array))
            .map((m) => m.values)
            .flat();
          const fillUnRightAnswers = (rightAnswer, array) => {
            return array
              .filter((f) => f.label !== rightAnswer)
              .sort(() => 0.5 - Math.random())
              .slice(0, 3)
              .map((m) => {
                m.isRight = false;
                m.label = m.label.replace('\r', '');
                return m;
              });
          };

          array = array.map((m) => {
            m.values = [
              ...m.values,
              ...fillUnRightAnswers(m.values[0].label, answers),
            ];
            return m;
          });

          let idNum = 0;
          array = array
            .filter(
              (f) => !f.label || f.values.filter((v) => !v.label).length < 4,
            )
            .sort(() => 0.5 - Math.random())
            .map((m) => {
              m.values = m.values.map((v) => {
                v.id = idNum;
                idNum += 1;
                return v;
              });
              return m;
            });

          array.forEach(async (q) => {
            const quizRow: QuizDTO = new QuizEntity();
            Object.assign(quizRow, {
              questionData: q,
            });

            try {
              await this.quizRepository.save(
                this.quizRepository.create(quizRow),
              );
            } catch (error) {
              //
            }
          });

          console.log('Quiz questions loaded, count: ', array.length);
        });
      }
    } catch (error) {
      console.log(error);
    }
  }

  savePlayer(player: PlayerDTO): Promise<{ status: number }> {
    return new Promise(async (resolve, reject) => {
      try {
        const playerRow: PlayerDTO = player;
        await this.playerRepository.save(playerRow);
        resolve({ status: 200 });
      } catch (error) {
        resolve({ status: 400 });
        console.log(error);
      }
    });
  }

  getActiveFund(): Promise<{ status: number; fund?: FundDTO }> {
    return new Promise(async (resolve, reject) => {
      try {
        const fund: FundDTO = await this.fundRepository.findOne({
          where: {
            isActive: true,
          },
        });

        if (fund) {
          resolve({ status: 200, fund });
        } else {
          resolve({ status: 400 });
        }
      } catch (error) {
        console.log(error);
      }
    });
  }

  saveFund(fund: FundDTO): Promise<{ status: number }> {
    return new Promise(async (resolve, reject) => {
      try {
        const fundRow: FundDTO = fund;
        await this.fundRepository.save(fundRow);
        resolve({ status: 200 });
      } catch (error) {
        resolve({ status: 400 });
        console.log(error);
      }
    });
  }
}
