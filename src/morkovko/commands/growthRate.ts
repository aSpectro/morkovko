import Command from './Command';
import { setEmbedAuthor } from './helpers';
import { AppService } from './../../app.service';
import e from 'express';

export class GRCommand extends Command {
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
      const { slotSpeedUpdate } = this.config.bot.economy;
      service.checkUser(user.id).then((res) => {
        if (res.status === 200 && res.player) {
          const player = res.player;
          const price = this.getPrice(player.slotsCount, slotSpeedUpdate);
          if (player.points >= price && this.canBuy(player.carrotSize, 'slotSpeedUpdate', player.config.slotSpeedUpdate)) {
            player.config.slotSpeedUpdate += 1;
            player.points -= price;
            service.savePlayer(player).then((resSave) => {
              if (resSave.status === 200) {
                this.embed.setDescription(
                  `Ты увеличил бонус скорости роста морковки в горшках. Текущий бонус **${player.config.slotSpeedUpdate}%**`,
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
            if (!this.canBuy(player.carrotSize, 'slotSpeedUpdate', player.config.slotSpeedUpdate)) {
              this.embed.setDescription(
                `Ты не можешь купить этот бонус!`,
              );
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
