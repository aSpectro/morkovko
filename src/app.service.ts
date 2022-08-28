import { performance } from 'node:perf_hooks';
import { Injectable } from '@nestjs/common';
import { configService } from './config/config.service';
import { Cron } from '@nestjs/schedule';
import config from './morkovko/config';
import { EmbedBuilder } from 'discord.js';
import { calcSlotProgress } from './morkovko/commands/helpers';

import { InjectRepository } from '@nestjs/typeorm';
import * as moment from 'moment';
import { Repository } from 'typeorm';
import { PlayerEntity } from './entities/player.entity';
import { PlayerDTO, PlayerReqDTO } from './dto/player.dto';

const hourProgress = config.bot.hourProgress;
const mafiaChannelId = configService.getMorkovkoChannel();

@Injectable()
export class AppService {
  client: any;
  constructor(
    @InjectRepository(PlayerEntity)
    private playerRepository: Repository<PlayerEntity>,
  ) {}

  @Cron('0 11 * * * *')
  async gameTick() {
    const tStart = performance.now();
    try {
      const data: PlayerDTO[] = await this.playerRepository.find();
      let slotsCount = 0;
      for (const player of data) {
        const slots = player.slots;
        slotsCount += slots.length;

        for (const slot of slots) {
          const progressWithFactor = calcSlotProgress(
            slot,
            player.progressBonus,
            hourProgress,
            player.config.slotSpeedUpdate,
          );

          if (progressWithFactor >= 100) {
            player.carrotCount += 1 * player.progressBonus;
            slot.factor = 0;
            slot.progress = 0;
          } else {
            slot.progress = progressWithFactor;
          }
        }

        if (
          !player.hasPugalo &&
          player.points >= config.bot.economy.pugalo &&
          player.config.autoBuyPugalo
        ) {
          player.hasPugalo = true;
          player.points -= config.bot.economy.pugalo;
        }

        this.savePlayer(player);
      }
      const tEnd = performance.now();
      console.log('gameTick performance: ' + (tEnd - tStart) + ' milliseconds');
      console.log(`Всего горшков: ${slotsCount}`);
      console.log(`Всего игроков: ${data.length}`);
    } catch (error) {
      console.log(error);
    }
  }

  @Cron('0 0 */12 * * *')
  async gameMafia() {
    if (!configService.isProduction()) return;
    try {
      const data: PlayerDTO[] = await this.playerRepository.find({
        where: {
          hasPugalo: false,
        },
      });
      const prey = data[Math.floor(Math.random() * data.length)];
      const preySlotsCount = prey ? prey.slots.length : 1;
      const embed = new EmbedBuilder().setColor('#f97a50');
      if (preySlotsCount > 1) {
        const grab = Math.floor(preySlotsCount / 2);
        const preyGrabCount = grab === 0 ? 1 : grab;
        for (let i = 0; i < preyGrabCount; i++) {
          prey.slots.pop();
        }
        this.savePlayer(prey).then((res) => {
          if (res.status === 200) {
            embed.setDescription(
              `Внимание фермеры!\nВ нашем районе активизировалась **Морковная Мафия**!\n
              Один из фермеров, <@${prey.userId}> был подвержен нападению, **Морковная Мафия** изъяла у него **${preyGrabCount}** 🧺!`,
            );

            this.client.channels
              .fetch(mafiaChannelId)
              .then((channel: any) => {
                channel.send({ embeds: [embed] });
              })
              .catch(console.error);
            this.deletePugalos();
          }
        });
      } else {
        embed.setDescription(
          `Внимание фермеры!\nВ нашем районе активизировалась **Морковная Мафия**!\n
          К счастью, никто из фермеров не был подвержен нападению!`,
        );

        this.client.channels
          .fetch(mafiaChannelId)
          .then((channel: any) => {
            channel.send({ embeds: [embed] });
          })
          .catch(console.error);
      }
    } catch (error) {
      console.log(error);
    }
  }

  @Cron('0 0 1 * * *')
  async resetGifts() {
    try {
      await this.playerRepository
        .createQueryBuilder()
        .update()
        .set({
          dailyGiftCount: 3,
        })
        .execute();
    } catch (error) {
      console.log(error);
    }
  }

  setClient(client: any) {
    this.client = client;
  }

  getUsername(userId: string): Promise<{ status: number; username?: string }> {
    return new Promise(async (resolve, reject) => {
      try {
        const user = await this.client.users.fetch(userId);
        if (user) {
          resolve({ status: 200, username: user.username });
        } else {
          resolve({ status: 400 });
        }
      } catch (error) {
        resolve({ status: 400 });
      }
    });
  }

  getUsersIds(): Promise<{ status: number; data?: string[] }> {
    return new Promise(async (resolve, reject) => {
      try {
        const data = await this.playerRepository.find();
        resolve({ status: 200, data: data.map((m) => m.userId) });
      } catch (error) {
        resolve({ status: 400 });
      }
    });
  }

  getUsersTop(): Promise<{ status: number; data?: PlayerDTO[] }> {
    return new Promise(async (resolve, reject) => {
      try {
        const data = await this.playerRepository.find({
          order: {
            carrotSize: 'DESC',
          },
        });
        resolve({ status: 200, data });
      } catch (error) {
        resolve({ status: 400 });
      }
    });
  }

  createPlayer(player: PlayerReqDTO): Promise<{ status: number }> {
    return new Promise(async (resolve, reject) => {
      const playerRow: PlayerDTO = new PlayerEntity();
      Object.assign(playerRow, {
        ...player,
        lastPrayDate: moment(new Date()).subtract(1, 'days').toDate(),
        lastWateringDate: moment(new Date()).subtract(1, 'hours').toDate(),
      });

      try {
        await this.playerRepository.save(playerRow);
        resolve({ status: 200 });
      } catch (error) {
        resolve({ status: 400 });
        // console.log(error);
      }
    });
  }

  checkUser(userId: string): Promise<{ status: number; player?: PlayerDTO }> {
    return new Promise(async (resolve, reject) => {
      try {
        const player: PlayerDTO = await this.playerRepository.findOne({
          where: { userId },
        });

        if (player) {
          resolve({ status: 200, player });
        } else {
          resolve({ status: 400 });
        }
      } catch (error) {
        console.log(error);
      }
    });
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

  deletePugalos(): Promise<{ status: number }> {
    return new Promise(async (resolve, reject) => {
      try {
        await this.playerRepository
          .createQueryBuilder()
          .update()
          .set({
            hasPugalo: false,
          })
          .execute();
        resolve({ status: 200 });
      } catch (error) {
        resolve({ status: 400 });
        console.log(error);
      }
    });
  }

  watering(player: PlayerDTO): Promise<{ status: number }> {
    return new Promise(async (resolve, reject) => {
      for (const slot of player.slots) {
        slot.factor += 5;
      }

      const playerRow: PlayerDTO = new PlayerEntity();
      Object.assign(playerRow, {
        ...player,
        lastWateringDate: moment(new Date()).toDate(),
      });

      try {
        await this.playerRepository.save(playerRow);
        resolve({ status: 200 });
      } catch (error) {
        resolve({ status: 400 });
        // console.log(error);
      }
    });
  }

  nullCarrots(): Promise<{ status: number }> {
    return new Promise(async (resolve, reject) => {
      try {
        await this.playerRepository
          .createQueryBuilder()
          .update()
          .set({
            carrotCount: 0,
          })
          .execute();
        resolve({ status: 200 });
      } catch (error) {
        resolve({ status: 400 });
        console.log(error);
      }
    });
  }

  nullPoints(): Promise<{ status: number }> {
    return new Promise(async (resolve, reject) => {
      try {
        await this.playerRepository
          .createQueryBuilder()
          .update()
          .set({
            points: 0,
          })
          .execute();
        resolve({ status: 200 });
      } catch (error) {
        resolve({ status: 400 });
        console.log(error);
      }
    });
  }

  giveCarrots(userId: string, count: number): Promise<{ status: number }> {
    return new Promise(async (resolve, reject) => {
      try {
        const player = await this.playerRepository.findOne({
          where: { userId },
        });

        if (player) {
          player.carrotCount += count;
          const playerRow: PlayerDTO = player;
          await this.playerRepository.save(playerRow);
          resolve({ status: 200 });
        } else {
          resolve({ status: 400 });
        }
      } catch (error) {
        resolve({ status: 400 });
        console.log(error);
      }
    });
  }

  givePoints(userId: string, count: number): Promise<{ status: number }> {
    return new Promise(async (resolve, reject) => {
      try {
        const player = await this.playerRepository.findOne({
          where: { userId },
        });

        if (player) {
          player.points += count;
          const playerRow: PlayerDTO = player;
          await this.playerRepository.save(playerRow);
          resolve({ status: 200 });
        } else {
          resolve({ status: 400 });
        }
      } catch (error) {
        resolve({ status: 400 });
        console.log(error);
      }
    });
  }
}
