import { Injectable } from '@nestjs/common';
import { configService } from './config/config.service';
import { Cron } from '@nestjs/schedule';
import config from './morkovko/config';
import { EmbedBuilder } from 'discord.js';
import {
  calcProgress,
  calcPrice,
  findNeighbours,
  abbreviateNumber,
} from './morkovko/commands/helpers';
import locale from 'src/modes';

import { InjectRepository } from '@nestjs/typeorm';
import * as moment from 'moment';
import { MoreThan, Repository } from 'typeorm';
import { PlayerEntity } from './entities/player.entity';
import { LogEntity } from './entities/log.entity';
import { FundEntity } from './entities/fund.entity';
import { ReportEntity } from './entities/report.entity';
import { PlayerDTO, PlayerReqDTO } from './dto/player.dto';
import { LogDTO } from './dto/log.dto';
import { FundDTO } from './dto/fund.dto';
import { ReportDTO } from './dto/report.dto';

const mafiaChannelId = configService.getMorkovkoChannel();

@Injectable()
export class AppService {
  client: any;
  constructor(
    @InjectRepository(PlayerEntity)
    private playerRepository: Repository<PlayerEntity>,

    @InjectRepository(LogEntity)
    private logRepository: Repository<LogEntity>,

    @InjectRepository(ReportEntity)
    private reportRepository: Repository<ReportEntity>,

    @InjectRepository(FundEntity)
    private fundRepository: Repository<FundEntity>,
  ) {}

  @Cron('0 * * * * *')
  async gameTick() {
    try {
      const data: PlayerDTO[] = await this.playerRepository.find();
      const idsFairEnd = [];
      for (const player of data) {
        const slots = player.slotsCount;

        if (!player.config.stars) {
          player.config.debuffs = 0;
          player.config.stars = {
            isDung: false,
            isThief: false,
            isDebuff: false,
          };
        }

        let expBonus = 0;
        if (player.config.fair && player.config.fair.isActive) {
          const d1 = moment(player.config.fair.startDate);
          const d2 = moment(new Date());
          const diff = d2.diff(d1, 'minutes');
          const needDiff = 1440; // 1 day
          if (diff >= needDiff) {
            const stars = player.config.fair.reward?.stars;
            const carrots = player.config.fair.reward?.carrots;
            const exp = player.config.fair.reward?.exp;
            if (stars) player.stars += stars;
            if (carrots) player.carrotCount += carrots * player.progressBonus;
            if (exp) expBonus = exp * player.progressBonus;
            player.config.fair.isActive = false;
            player.config.fair.reward = {};
            idsFairEnd.push(player.userId);
          }
        }

        for (const hero of player.wars.heroes) {
          hero.exp +=
            player.progressBonus * 1 +
            Math.round(expBonus / player.wars.heroes.length);
        }

        player.carrotCount +=
          calcProgress(
            slots,
            player.progressBonus,
            player.factorSpeed,
            player.config.slotSpeedUpdate,
            player.config.debuffs,
            player.config.stars.isDung,
          ) * player.progressBonus;

        if (
          !player.hasPugalo &&
          player.points >= calcPrice(slots, config.bot.economy.pugalo) &&
          player.config.autoBuyPugalo
        ) {
          player.hasPugalo = true;
          player.points -= calcPrice(slots, config.bot.economy.pugalo);
        }

        this.savePlayer(player);
      }

      if (idsFairEnd.length > 0) {
        const embed = new EmbedBuilder().setColor('#f97a50');
        const playersMentions = idsFairEnd.map((m) => `<@${m}>`).join(', ');
        embed.setDescription(
          `**Новости Ярмарки**\n${playersMentions} вернулись с ярморки и получили свои награды!`,
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

  @Cron('30 0 */12 * * *')
  async gameMafia() {
    try {
      const data: PlayerDTO[] = await this.playerRepository.find({
        where: {
          hasPugalo: false,
          slotsCount: MoreThan(10),
        },
      });
      const dataFiltered = data.filter((f) => f.config?.fair?.isActive);

      for (const player of dataFiltered) {
        const grab = Math.floor(player.slotsCount / 2);
        const preyGrabCount = grab === 0 ? 1 : grab;
        player.slotsCount -= preyGrabCount;
        player.carrotCount -= Math.round(player.carrotCount * 0.25);
        player.carrotSize -= Math.round(player.carrotSize * 0.05);
        await this.savePlayer(player);
      }

      const embed = new EmbedBuilder().setColor('#f97a50');

      if (dataFiltered.length > 0) {
        const playersMentions = dataFiltered
          .map((m) => `<@${m.userId}>`)
          .join(', ');
        embed.setDescription(
          `Внимание фермеры!\nВ нашем районе активизировалась **Морковная Мафия**!\n
          ${playersMentions} были подвержены нападению, **Морковная Мафия** изъяла у них половину 🧺!\n
          Так же они выпустили на их фермы **колорадских жуков** 🐛, они пожрали **25%** урожая и отгрызли **5%** от ${locale.getEnum('длины')} конкурсных ${locale.getEnum('морковок')}.`,
        );
      } else {
        embed.setDescription(
          `Внимание фермеры!\nВ нашем районе активизировалась **Морковная Мафия**!\n
          К счастью, никто из фермеров не был подвержен нападению!`,
        );
      }

      this.client.channels
        .fetch(mafiaChannelId)
        .then((channel: any) => {
          channel.send({ embeds: [embed] });
        })
        .catch(console.error);
    } catch (error) {
      console.log(error);
    }
  }

  @Cron('50 0 12 * * *')
  async pugalosResetTask() {
    try {
      this.deletePugalos();
    } catch (error) {
      console.log(error);
    }
  }

  @Cron('30 30 */12 * * *')
  async resetWatering() {
    try {
      await this.playerRepository
        .createQueryBuilder()
        .update()
        .set({
          factorSpeed: 0,
        })
        .execute();
    } catch (error) {
      console.log(error);
    }
  }

  @Cron('30 0 1 * * *')
  async resetGifts() {
    try {
      const data: PlayerDTO[] = await this.playerRepository.find();
      for (const player of data) {
        player.dailyGiftCount = 3;
        player.dailyWateringCount = 0;
        player.policeReportCount = 0;
        player.config.isDonateToday = false;
        player.config.stars.isDebuff = false;
        player.config.stars.isDung = false;
        player.config.stars.isThief = false;
        player.config.debuffs = 0;
        await this.savePlayer(player);
      }
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * Kassio AC Native v.1.0.1
   * reports reaper
   */
  @Cron('0 */5 * * * *')
  async kassioAC() {
    try {
      // fetch all users
      const players: PlayerEntity[] = await this.playerRepository.find();
      for (const player of players.filter((f) => f.config?.fair?.isActive)) {
        const { userId } = player;
        // get last day logs
        const excludes = [
          'скорость-роста',
          'кулдаун-свидание',
          'кулдаун-полив',
          'кулдаун-молитва',
          'инфо',
          'помощь',
          'выкти',
          'магазин',
          'инвентарь',
          'начать',
          'свидание',
          'подарить',
          'игрок',
          'ping',
          'топ',
          'увеличить',
          'босс',
          'герои',
          'герой',
          'паб',
        ];
        const logs = (
          await this.logRepository.find({
            where: {
              userId: userId,
              reported: false,
              executeDate: MoreThan(
                moment(new Date()).subtract(1, 'days').toDate(),
              ),
            },
          })
        ).filter((f) => excludes.indexOf(f.commandName) === -1);

        // order logs commands
        const logsOrderCommands: { [key: string]: LogDTO[] } = {};
        logs.forEach((log) => {
          if (logsOrderCommands[log.commandName]) {
            logsOrderCommands[log.commandName].push(log);
          } else {
            logsOrderCommands[log.commandName] = [log];
          }
        });

        // check commands regularity
        Object.entries(logsOrderCommands).forEach(async (command) => {
          const minutes = [];
          command[1].forEach((log) => {
            const m = moment(log.executeDate).minutes();
            minutes.push(m);
          });
          const repeats: { [key: string]: number } = {};
          minutes.forEach((x) => {
            repeats[x] = (repeats[x] || 0) + 1;
          });
          let maxRepeats = 0;
          Object.entries(repeats).forEach((r) => {
            if (r[1] > maxRepeats) maxRepeats = r[1];
          });

          if (maxRepeats >= 15) {
            const userReports = await this.reportRepository.find({
              where: {
                userId: userId,
              },
            });
            const reportsCount =
              userReports.length > 0 ? userReports.length : 1;
            const ePrice = config.bot.economy.policeFine;
            const price =
              Math.round((player.slotsCount / 50) * ePrice + ePrice) *
              reportsCount;
            player.carrotCount -= price;
            this.savePlayer(player).then((res) => {
              if (res.status === 200) {
                this.sendPoliceReport(userId, price, logsOrderCommands);
                command[1].forEach(async (log) => {
                  log.reported = true;
                  await this.logRepository.save(log);
                });
              }
            });
          }
        });
      }
    } catch (error) {
      console.log(error);
    }
  }

  setClient(client: any) {
    this.client = client;
  }

  sendPoliceReport(userId: string, price, logs: { [key: string]: LogDTO[] }) {
    const report: ReportDTO = {
      userId,
      fineCount: price,
      commandsLogs: logs,
    };
    this.report(report).then(async (res) => {
      if (res.status === 200) {
        const fundRes = await this.getActiveFund();
        if (fundRes.status === 200) {
          const fund = fundRes.fund;
          fund.fundSize += price;
          await this.saveFund(fund);
        }
        const embed = new EmbedBuilder().setColor('#f5222d');
        embed.setDescription(
          `**В эфире криминальные новости!**\n
          Департамент региональной безопасности и противодействия моррупции Морковного края провел спец. операцию по противодействию моррупции по добыче и сбыту морковки. В ходе операции был задержан и оштрафован <@${userId}>.\n
          Молиция оштрафовала его на **${abbreviateNumber(price)}** ${locale.getCurrency()}!\n
          Граждане фермеры, наш департамент благодарит всех законопослушных граждан и желает им хорошего урожая!`,
        );

        this.client.channels
          .fetch(mafiaChannelId)
          .then((channel: any) => {
            channel.send({ embeds: [embed] });
          })
          .catch(console.error);
      }
    });
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

  getUserNeighbours(userId: string): Promise<{
    status: number;
    data?: PlayerDTO[];
  }> {
    return new Promise(async (resolve, reject) => {
      try {
        const data = await this.playerRepository.find({
          order: {
            id: 'ASC',
          },
        });
        resolve({ status: 200, data: findNeighbours(data, userId) });
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
        slotsCount: 1,
        lastPrayDate: moment(new Date()).subtract(1, 'days').toDate(),
        lastWateringDate: moment(new Date()).subtract(1, 'hours').toDate(),
      });

      try {
        await this.playerRepository.save(
          this.playerRepository.create(playerRow),
        );
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
      player.factorSpeed += 5;
      player.dailyWateringCount += 1;

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

  giveSlots(userId: string, count: number): Promise<{ status: number }> {
    return new Promise(async (resolve, reject) => {
      try {
        const player = await this.playerRepository.findOne({
          where: { userId },
        });

        if (player) {
          player.slotsCount += count;
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

  log(log: LogDTO): Promise<{ status: number }> {
    return new Promise(async (resolve, reject) => {
      const logRow: LogDTO = new LogEntity();
      Object.assign(logRow, {
        ...log,
      });
      try {
        await this.logRepository.save(this.logRepository.create(logRow));
        resolve({ status: 200 });
      } catch (error) {
        resolve({ status: 400 });
        console.log(error);
      }
    });
  }

  report(report: ReportDTO): Promise<{ status: number }> {
    return new Promise(async (resolve, reject) => {
      const reportRow: ReportDTO = new ReportEntity();
      Object.assign(reportRow, report);
      try {
        await this.reportRepository.save(
          this.reportRepository.create(reportRow),
        );
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

  getStats(): Promise<{
    status: number;
    stats?: {
      commandsCount: number;
      playersCount: number;
      allCarrotsCount: number;
    };
  }> {
    return new Promise(async (resolve, reject) => {
      try {
        const players: PlayerDTO[] = await this.playerRepository.find();
        const logs: number = await this.logRepository.count();

        if (players && logs) {
          const stats = {
            commandsCount: logs,
            playersCount: players.length,
            allCarrotsCount: players.reduce(
              (t, player) => player.carrotCount + t,
              0,
            ),
          };
          resolve({ status: 200, stats });
        } else {
          resolve({ status: 400 });
        }
      } catch (error) {
        console.log(error);
      }
    });
  }
}
