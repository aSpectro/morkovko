import Command from './Command';
import * as moment from 'moment';
import {
  setEmbedAuthor,
  getTimeFromMins,
  calcNumberWithPercentBoost,
  abbreviateNumber,
} from './helpers';
import { AppService } from './../../app.service';
import { WarsService } from 'src/wars.service';

export class InfoCommand extends Command {
  constructor(
    commandName: string,
    needEvents: boolean,
    warsService?: WarsService,
  ) {
    super(commandName, needEvents, warsService);
  }

  run(
    message: any,
    args: any,
    service: AppService,
    isSlash: boolean | undefined,
  ) {
    this.initCommand(message, args, service, isSlash, () => {
      const user = this.getUser();
      service.checkUser(user.id).then((res) => {
        if (res.status === 200) {
          const player = res.player;
          const d1 = moment(player.lastWateringDate);
          const d2 = moment(new Date());
          const diff = d2.diff(d1, 'minutes');
          const needDiff = calcNumberWithPercentBoost(
            60,
            player.config.cooldowns.watering,
          );

          const d1Pray = moment(player.lastPrayDate);
          const d2Pray = moment(new Date());
          const diffPray = d2Pray.diff(d1Pray, 'minutes');
          const needDiffPray = calcNumberWithPercentBoost(
            1440,
            player.config.cooldowns.pray,
          );

          const d1A = moment(player.lastADate);
          const d2A = moment(new Date());
          const diffA = d2A.diff(d1A, 'minutes');
          const needDiffA = calcNumberWithPercentBoost(
            1440,
            player.config.cooldowns.adate,
          );

          let watering = '';
          let pray = '';
          let adate = '';
          let fair = '🎃 Ты не участвуешь в ярмарке!\n';

          if (player.config?.fair?.isActive) {
            const d1Fair = moment(player.config.fair.startDate);
            const d2Fair = moment(new Date());
            const diffFair = d2Fair.diff(d1Fair, 'minutes');
            const needDiffFair = 1440;

            if (diffFair < needDiffFair) {
              fair = `🎃 Ты вернешься с ярмарки через ${getTimeFromMins(
                needDiffFair - diffFair,
              )}\n`;
            }
          }

          if (diff >= needDiff) {
            watering = '💧 Полив морковки доступен.\n';
          } else {
            watering = `💧 Ты сможешь полить морковку не раньше чем через ${getTimeFromMins(
              needDiff - diff,
            )}\n`;
          }

          if (diffPray >= needDiffPray) {
            pray = '🙏 Молитва доступна.\n';
          } else {
            pray = `🙏 Ты сможешь помолиться не раньше чем через ${getTimeFromMins(
              needDiffPray - diffPray,
            )}\n`;
          }

          if (diffA >= needDiffA) {
            adate = '👨🏻‍🤝‍👨🏻 Свидание доступно.\n';
          } else {
            adate = `👨🏻‍🤝‍👨🏻 Ты сможешь сходить на свидание не раньше чем через ${getTimeFromMins(
              needDiffA - diffA,
            )}\n`;
          }

          const gameTime = `Игровое время: **${moment(new Date()).format(
            'HH:mm',
          )}**\n`;

          let exit = '';
          if (
            player.carrotSize >= this.getExitCarrotSize(player.progressBonus)
          ) {
            exit = `Можно выкти и получить бонусы!`;
          } else {
            exit = `Чтобы выкти, нужно вырастить морковку еще на **${abbreviateNumber(
              this.getExitCarrotSize(player.progressBonus) - player.carrotSize,
            )}см**`;
          }

          this.embed.setDescription(
            `${gameTime + watering + pray + adate + fair + exit}`,
          );
          this.send({ embeds: [setEmbedAuthor(this.embed, user)] });
        } else {
          this.replyNoUser(user);
        }
      });
    });
  }
}
