import Command from './Command';
import { setEmbedAuthor, abbreviateNumber } from './helpers';
import { AppService } from './../../app.service';

export class UpgradeCommand extends Command {
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
      const { upgrade } = this.config.bot.economy;
      service.checkUser(user.id).then((res) => {
        if (res.status === 200) {
          const player = res.player;
          const price = this.getPrice(player.slotsCount, upgrade);
          const count = this.getArgString('кол-во');
          if (count && player.points >= count * price && count <= 5) {
            player.carrotSize += count;
            if (player.config.stars.isDung && player.carrotSize % 5 === 0) {
              player.carrotSize += 1;
            }
            player.points -= count * price;
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
            if (!count) {
              this.embed.setDescription(`Ты не указал кол-во раз!`);
            } else if (count > 5) {
              this.embed.setDescription(
                `За раз, морковку можно увеличить только на 5см!`,
              );
            } else {
              this.embed.setDescription(
                `Тебе не хватает ${abbreviateNumber(
                  count * price - player.points,
                )}🔸!`,
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
