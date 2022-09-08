import Command from './Command';
import * as moment from 'moment';
import {
  setEmbedAuthor,
  getTimeFromMins,
  calcNumberWithPercentBoost,
} from './helpers';
import { AppService } from './../../app.service';

export class WateringCommand extends Command {
  constructor(commandName: string) {
    super(commandName);
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
          const diffSeconds = Math.abs(d1.seconds() - d2.seconds());
          const needDiff = calcNumberWithPercentBoost(
            60,
            player.config.cooldowns.watering,
          );

          if (diffSeconds <= 10) {
            player.policeReportCount += 1;
          }

          if (
            diff >= needDiff &&
            player.policeReportCount > 3 &&
            player.dailyWateringCount <= 16
          ) {
            service.watering(res.player).then((resWatering) => {
              if (resWatering.status === 200) {
                this.embed.setDescription(`Морковка полита!`);
                this.send({
                  embeds: [setEmbedAuthor(this.embed, user)],
                });
              } else {
                this.embed.setDescription(
                  `Не получилось полить морковку, попробуй позже!`,
                );
                this.send({
                  embeds: [setEmbedAuthor(this.embed, user)],
                });
              }
            });
          } else {
            if (diff < needDiff) {
              this.embed.setDescription(
                `Ты сможешь полить морковку не раньше чем через ${getTimeFromMins(
                  needDiff - diff,
                )}!`,
              );
            } else {
              const price = this.getPrice(
                player.slotsCount,
                this.config.bot.economy.policeFine,
              );
              player.carrotCount -= price;
              service.savePlayer(player).then((resSave) => {
                if (resSave.status === 200) {
                  this.service.sendPoliceReport(player.userId, price);
                }
              });
            }
            this.send({
              embeds: [setEmbedAuthor(this.embed, user)],
            });
          }
        } else {
          this.replyNoUser(user);
        }
      });
    });
  }
}
