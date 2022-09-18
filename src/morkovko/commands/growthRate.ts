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
          const price = this.getPrice(player.slotsCount, slotSpeedUpdate, player.progressBonus);
          const count = this.getArgString('кол-во');
          if (count && player.points >= price * count && this.canBuy(player.carrotSize, 'slotSpeedUpdate', player.config.slotSpeedUpdate, count)) {
            player.config.slotSpeedUpdate += count;
            player.points -= price * count;
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
            if (!count) {
              this.embed.setDescription(`Ты не указал кол-во!`);
            } else if (!this.canBuy(player.carrotSize, 'slotSpeedUpdate', player.config.slotSpeedUpdate, count)) {
              const acceptedCount = 50 - (player.config.slotSpeedUpdate + count);
              if (acceptedCount <= 0) {
                this.embed.setDescription(
                  `Ты не можешь купить этот бонус! Сейчас у тебя ${player.config.slotSpeedUpdate}/50.`,
                );
              } else if (player.carrotSize < this.config.bot.economy.shopRules['slotSpeedUpdate']) {
                this.embed.setDescription(`Твоя морковка слишком маленькая!`);
              } else {
                this.embed.setDescription(
                  `Ты можешь купить не больше ${acceptedCount} бонусов! Сейчас у тебя ${player.config.slotSpeedUpdate}/50.`,
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
