import Command from './Command';
import * as moment from 'moment';
import { setEmbedAuthor } from './helpers';
import { AppService } from './../../app.service';
import { WarsService } from 'src/wars.service';

export class FairCommand extends Command {
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
        if (res.status === 200 && res.player) {
          const player = res.player;

          if (!player.config?.fair?.isActive) {
            player.config.fair = {
              isActive: true,
              startDate: moment(new Date()).toDate(),
              reward: {
                stars: 100,
                carrots: 100000,
                exp: 5000,
              },
            };
            service.savePlayer(player).then((resSave) => {
              if (resSave.status === 200) {
                this.embed.setDescription(
                  `Ты отправился на ярмарку. Теперь ты можешь участвовать в ежедневной викторине и использовать магазин звезд!\nНо не забывай, что ты так же можешь стать жертвой Морковной Мафии или оштрафован Фондом борьбы с моррупцией.`,
                );
                this.send({
                  embeds: [setEmbedAuthor(this.embed, user)],
                });
              } else {
                this.embed.setDescription(
                  `Не получилось отправиться на ярмарку. Попробуй позже.`,
                );
                this.send({
                  embeds: [setEmbedAuthor(this.embed, user)],
                });
              }
            });
          } else {
            this.embed.setDescription('Ты уже участвуешь в ярмарке!');
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
