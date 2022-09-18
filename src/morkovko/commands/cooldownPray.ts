import Command from './Command';
import { setEmbedAuthor } from './helpers';
import { AppService } from './../../app.service';

export class CPCommand extends Command {
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
      const { cooldowns } = this.config.bot.economy;
      service.checkUser(user.id).then((res) => {
        if (res.status === 200 && res.player) {
          const player = res.player;
          const price = this.getPrice(player.slotsCount, cooldowns.pray);
          const count = this.getArgString('кол-во');
          if (count && player.points >= price * count && this.canBuy(player.carrotSize, 'cooldowns', player.config.cooldowns.pray, count)) {
            player.config.cooldowns.pray += count;
            player.points -= price * count;
            service.savePlayer(player).then((resSave) => {
              if (resSave.status === 200) {
                this.embed.setDescription(
                  `Ты уменьшил кулдаун молитвы на 1%. Текущий бонус **${player.config.cooldowns.pray}%**`,
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
            if (!count) {
              this.embed.setDescription(`Ты не указал кол-во!`);
            } else if (!this.canBuy(player.carrotSize, 'cooldowns', player.config.cooldowns.pray, count)) {
              const acceptedCount = 50 - (player.config.cooldowns.pray + count);
              if (acceptedCount <= 0) {
                this.embed.setDescription(
                  `Ты не можешь купить этот бонус! Сейчас у тебя ${player.config.cooldowns.pray}/50.`,
                );
              } else if (player.carrotSize < this.config.bot.economy.shopRules['cooldowns']) {
                this.embed.setDescription(`Твоя морковка слишком маленькая!`);
              } else {
                this.embed.setDescription(
                  `Ты можешь купить не больше ${acceptedCount} бонусов! Сейчас у тебя ${player.config.cooldowns.pray}/50.`,
                );
              }
            } else {
              this.embed.setDescription(
                `Тебе не хватает ${price - player.points}🔸!`,
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
