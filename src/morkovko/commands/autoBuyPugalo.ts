import Command from './Command';
import { setEmbedAuthor, abbreviateNumber } from './helpers';
import { AppService } from './../../app.service';
import { WarsService } from 'src/wars.service';

export class ABPCommand extends Command {
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
      const { autoBuyPugalo } = this.config.bot.economy;
      service.checkUser(user.id).then((res) => {
        if (res.status === 200 && res.player) {
          const player = res.player;
          const price = this.getPrice(player.slotsCount, autoBuyPugalo);
          if (player.points >= price && !player.config.autoBuyPugalo && this.canBuy(player.carrotSize, 'autoBuyPugalo', 1)) {
            player.config.autoBuyPugalo = true;
            player.points -= price;
            service.savePlayer(player).then((resSave) => {
              if (resSave.status === 200) {
                this.embed.setDescription(
                  `Ты купил бонус для автоматической покупки пугала. Пугало будет покупаться автоматически при наличии необходимого кол-ва 🔸 на счету.`,
                );
                this.send({
                  embeds: [setEmbedAuthor(this.embed, user)],
                });
              } else {
                this.embed.setDescription(
                  `Не получилось купить бонус. Попробуй позже.`,
                );
                this.send({
                  embeds: [setEmbedAuthor(this.embed, user)],
                });
              }
            });
          } else {
            if (player.config.autoBuyPugalo) {
              this.embed.setDescription(`У тебя уже есть бонус!`);
            } else if (!this.canBuy(player.carrotSize, 'autoBuyPugalo', 1)) {
              this.embed.setDescription(
                `Ты не можешь купить этот бонус, твоя морковка слишком маленькая!`,
              );
            } else {
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
