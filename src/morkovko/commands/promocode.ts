import Command from './Command';
import { setEmbedAuthor } from './helpers';
import { AppService } from './../../app.service';
import { WarsService } from 'src/wars.service';
import * as promocodes from '../../../promocodes.json';
import * as moment from 'moment';

export class PromocodeCommand extends Command {
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
          const code = this.getArgByIndex(0);
          if (code && promocodes.find(f => f.name === code.toLowerCase())) {
            if (player.config?.promocodes && player.config?.promocodes.includes(code.toLowerCase())) {
              this.embed.setDescription('Ты уже использовал этот промокод!');
              this.send({
                embeds: [setEmbedAuthor(this.embed, user)],
              });
            } else {
              const promocode = promocodes.find(f => f.name === code.toLowerCase());
              const d1 = moment(promocode.expires);
              const d2 = moment(new Date());
              if (d1.isAfter(d2)) {
                if (player.config?.promocodes) {
                  player.config.promocodes.push(code.toLowerCase());
                } else {
                  player.config.promocodes = [code.toLowerCase()];
                }
                if (promocode.rewards.carrots) {
                  player.carrotCount += promocode.rewards.carrots
                }
                if (promocode.rewards.stars) {
                  player.stars += promocode.rewards.stars
                }
                service.savePlayer(player).then((resSave) => {
                  if (resSave.status === 200) {
                    this.embed.setDescription(`Промокод успешно активирован!\n`);
                    this.send({
                      embeds: [setEmbedAuthor(this.embed, user)],
                    });
                  } else {
                    this.embed.setDescription(
                      `Не получилось активировать промокод. Попробуй позже.`,
                    );
                    this.send({
                      embeds: [setEmbedAuthor(this.embed, user)],
                    });
                  }
                });
              } else {
                this.embed.setDescription('Время действия промокода истекло!');
                this.send({
                  embeds: [setEmbedAuthor(this.embed, user)],
                });
              }
            }
          } else {
            this.embed.setDescription('Ты не указал промокод или такого промокода нет!');
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
