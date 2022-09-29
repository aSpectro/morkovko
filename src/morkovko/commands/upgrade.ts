import Command from './Command';
import { setEmbedAuthor, abbreviateNumber } from './helpers';
import { AppService } from './../../app.service';
import { WarsService } from 'src/wars.service';

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
      service.checkUser(user.id).then((res) => {
        if (res.status === 200) {
          const player = res.player;
          let count: any = this.getArgAll('кол-во');
          count = count === 'all' ? this.getMaxAllCount(player, true) : count;
          const price = this.getAllPrice(player, count, true);
          if (count && player.points >= price) {
            player.carrotSize += count;
            if (player.config.stars.isDung && player.carrotSize % 5 === 0) {
              player.carrotSize += 1;
            }
            player.points -= price;
            player.carrotAvatar = this.getRandomAvatar();
            service.savePlayer(player).then((resSave) => {
              if (resSave.status === 200) {
                this.embed.setDescription(
                  `Ты увеличил конкурсную морковку. Теперь ее размер **${abbreviateNumber(
                    player.carrotSize,
                  )}** см! Возможно она мутировала.`,
                );
                this.send({
                  embeds: [setEmbedAuthor(this.embed, user)],
                });
              } else {
                this.embed.setDescription(
                  `Не получилось увеличить конкурсную морковку. Попробуй позже.`,
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
