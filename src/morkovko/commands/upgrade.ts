import Command from './Command';
import { setEmbedAuthor, abbreviateNumber } from './helpers';
import { AppService } from './../../app.service';
import { WarsService } from 'src/wars.service';
import { Mutations } from './../../enums';

export class UpgradeCommand extends Command {
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
      service.checkUser(user.id).then(async (res) => {
        if (res.status === 200) {
          const player = res.player;
          let count: any = this.getArgAll('кол-во');
          count =
            count === 'all' ? await this.getMaxAllCount(player, true) : count;
          const price = this.getAllPrice(player, count, true);
          if (count && player.points >= price) {
            player.carrotSize += count;
            if (player.config.stars.isDung) {
              player.carrotSize += Math.floor(count / 5);
            }
            player.points -= price;
            player.carrotAvatar = this.getRandomAvatar(Mutations.carrot);
            player.pumpkinAvatar = this.getRandomAvatar(Mutations.pumpkin);
            service.savePlayer(player).then((resSave) => {
              if (resSave.status === 200) {
                this.embed.setDescription(
                  `Ты увеличил конкурсную ${this.locale.getEnum('морковку')}. Теперь ее размер **${abbreviateNumber(
                    player.carrotSize,
                  )}** см! Возможно она мутировала.`,
                );
                this.send({
                  embeds: [setEmbedAuthor(this.embed, user)],
                });
              } else {
                this.embed.setDescription(
                  `Не получилось увеличить конкурсную ${this.locale.getEnum('морковку')}. Попробуй позже.`,
                );
                this.send({
                  embeds: [setEmbedAuthor(this.embed, user)],
                });
              }
            });
          } else {
            if (this.getArgAll('кол-во') === 'all' && count === 0) {
              this.embed.setDescription(`Тебе пока не хватает 🔸!`);
            } else if (this.getArgAll('кол-во') !== 'all' && !count) {
              this.embed.setDescription(`Ты не указал кол-во раз!`);
            } else {
              console.log(price, count);
              this.embed.setDescription(
                `Тебе не хватает ${abbreviateNumber(price - player.points)}🔸!`,
              );
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
