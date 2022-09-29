import Command from './Command';
import { setEmbedAuthor, abbreviateNumber } from './helpers';
import { AppService } from './../../app.service';
import { WarsService } from 'src/wars.service';

export class CWCommand extends Command {
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
      const { cooldowns } = this.config.bot.economy;
      service.checkUser(user.id).then((res) => {
        if (res.status === 200 && res.player) {
          const player = res.player;
          const price = this.getPrice(player.slotsCount, cooldowns.watering);
          const count = this.getArgString('кол-во');
          if (count && player.points >= price * count && this.canBuy(player.carrotSize, 'cooldowns', player.config.cooldowns.watering, count)) {
            player.config.cooldowns.watering += count;
            player.points -= price * count;
            service.savePlayer(player).then((resSave) => {
              if (resSave.status === 200) {
                this.embed.setDescription(
                  `Ты уменьшил кулдаун полива на ${count}%. Текущий бонус **${player.config.cooldowns.watering}%**`,
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
            } else if (!this.canBuy(player.carrotSize, 'cooldowns', player.config.cooldowns.watering, count)) {
              const acceptedCount = 50 - (player.config.cooldowns.watering + count);
              if (acceptedCount <= 0) {
                this.embed.setDescription(
                  `Ты не можешь купить этот бонус! Сейчас у тебя ${player.config.cooldowns.watering}/50.`,
                );
              } else if (player.carrotSize < this.config.bot.economy.shopRules['cooldowns']) {
                this.embed.setDescription(`Твоя морковка слишком маленькая!`);
              } else {
                this.embed.setDescription(
                  `Ты можешь купить не больше ${acceptedCount} бонусов! Сейчас у тебя ${player.config.cooldowns.watering}/50.`,
                );
              }
            } else {
              this.embed.setDescription(
                `Тебе не хватает ${abbreviateNumber((price * count) - player.points)}🔸!`,
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
