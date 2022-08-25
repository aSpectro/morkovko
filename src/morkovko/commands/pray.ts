import Command from './Command';
import * as moment from 'moment';
import { setEmbedAuthor, getTimeFromMins } from './helpers';
import { AppService } from './../../app.service';

const counts = [5, 10, 15, 20];

export class PrayCommand extends Command {
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
          const d1 = moment(player.lastPrayDate);
          const d2 = moment(new Date());
          const diff = d2.diff(d1, 'minutes');
          const needDiff = 1440;

          if (diff >= needDiff) {
            const prayCarrots =
              counts[Math.floor(Math.random() * counts.length)];
            player.lastPrayDate = moment(new Date()).toDate();
            player.carrotCount += prayCarrots;
            service.savePlayer(player).then((resSave) => {
              if (resSave.status === 200) {
                this.embed.setDescription(
                  `Святая подарила тебе ${prayCarrots}🥕 за молитву!`,
                );
                this.send({
                  embeds: [setEmbedAuthor(this.embed, user)],
                });
              } else {
                this.embed.setDescription(
                  `Не получилось помолиться. Попробуй позже.`,
                );
                this.send({
                  embeds: [setEmbedAuthor(this.embed, user)],
                });
              }
            });
          } else {
            this.embed.setDescription(
              `Ты сможешь помолиться не раньше чем через ${getTimeFromMins(
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
