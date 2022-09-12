import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import { configService } from './../config/config.service';
import { Cron } from '@nestjs/schedule';
import config from './../morkovko/config';
import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js';
import { RedisService } from 'nestjs-redis';
import { calcProgress, calcPrice } from './../morkovko/commands/helpers';

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
  currentQuestion: any;
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
  }

  @Cron('10 * * * * *')
  async startPlayQuiz() {
    try {
      const fund: FundDTO = await this.fundRepository.findOne({
        where: {
          isActive: true,
        },
      });

      // await this.redis.set('test', '123');
      // await this.redis.del('test');
      // console.log(await this.redis.get('test'));

      if (fund) {
        const embed = new EmbedBuilder().setColor('#2f54eb');
        embed.setDescription(
          `На горизонте появилась странная сцена, кажется **Фонд борьбы с моррупцией** начал свою ежедневную викторину.\n
          Размер призового фонда **${fund.fundSize.toLocaleString()}** 🥕.\n
          На табличке с правилами написано:\n
          1. Викторина проходит каждый день, в 16:00 МСК.\n
          2. Размер призового фонда зависит от деятельности молиции и фонда.\n
          3. В викторине 10 вопросов, первый фермер ответивший верно получает 1 балл.\n
          4. По истечению вопросов, игрок, набравший больше всех баллов получает морковки из призового фонда.\n
          5. Если в конце игры игроки с большим числом баллов имеют равно кол-во баллов, то призовой фонд делиться между ними поровну.`,
        );

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

  @Cron('0 * * * * *')
  async fundRotator() {
    try {
      const fund: FundDTO = await this.fundRepository.findOne({
        where: {
          isActive: true,
        },
      });

      if (fund) {
        fund.isActive = false;
        await this.fundRepository.save(fund);
        this.createFund({});
      } else {
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

    const send = async (data) => {
      const embed = new EmbedBuilder().setColor('#2f54eb');
      embed.setDescription(
        `**Вопрос викторины**\n
        ❓ ${data.label}`,
      );

      console.log(data);
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
              .setLabel(`${v.label}`)
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
        if (this.currentQuestion < 10) {
          this.currentQuestion.id += 1;
          this.currentQuestion.qData = q;
          send(q.questionData);
        } else {
          await this.calcWinners();
        }
      } else {
        this.currentQuestion = {
          id: 1,
          qData: q,
        };
        send(q.questionData);
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
    //
  }

  async processAnswer(interaction: any) {
    console.log(interaction.customId);
    console.log(interaction.user.id);

    if (interaction.customId === 'primary') {
      await interaction.update({
        content: 'Приключения закончились..',
        embeds: [],
        components: [],
      });
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
}
