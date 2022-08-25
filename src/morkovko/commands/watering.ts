import Command from './Command';
import * as moment from 'moment';
import { setEmbedAuthor, getTimeFromMins } from './helpers';
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
          const d1 = moment(res.player.lastWateringDate);
          const d2 = moment(new Date());
          const diff = d2.diff(d1, 'minutes');
          const needDiff = 60;

          if (diff >= needDiff) {
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
            this.embed.setDescription(
              `Ты сможешь полить морковку не раньше чем через ${getTimeFromMins(
                needDiff - diff,
              )}!`,
            );
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
