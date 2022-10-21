import Command from './Command';
import {
  setEmbedAuthor,
  getCarrotLevel,
  getMaxSlots,
  abbreviateNumber,
} from './helpers';
import { AppService } from './../../app.service';
import { WarsService } from 'src/wars.service';

export class BuyCommand extends Command {
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
      const { slot } = this.config.bot.economy;
      service.checkUser(user.id).then((res) => {
        if (res.status === 200) {
          const player = res.player;
          const price = this.getPrice(player.slotsCount, slot);
          const maxSlots = getMaxSlots(getCarrotLevel(player.carrotSize));
          const playerSlots = player.slotsCount;
          let count: any = this.getArgAll('кол-во');
          count = count === 'all' ? maxSlots - playerSlots : count;
          if (
            count &&
            player.points >= count * price &&
            playerSlots + count <= maxSlots
          ) {
            player.slotsCount += count;
            player.points -= price * count;
            service.savePlayer(player).then((resSave) => {
              if (resSave.status === 200) {
                this.embed.setDescription(
                  `Ты купил ${count}🧺. Теперь у тебя **${abbreviateNumber(
                    player.slotsCount,
                  )}** 🧺!`,
                );
                this.send({
                  embeds: [setEmbedAuthor(this.embed, user)],
                });
              } else {
                this.embed.setDescription(
                  `Не получилось купить горшок. Попробуй позже.`,
                );
                this.send({
                  embeds: [setEmbedAuthor(this.embed, user)],
                });
              }
            });
          } else {
            if (
              this.getArgAll('кол-во') === 'all' &&
              count === 0 &&
              playerSlots + count < maxSlots
            ) {
              this.embed.setDescription(`Тебе пока не хватает 🔸!`);
            } else if (this.getArgAll('кол-во') !== 'all' && !count) {
              this.embed.setDescription(`Ты не указал кол-во 🧺!`);
            } else if (playerSlots + count > maxSlots) {
              this.embed.setDescription(
                `Ты не можешь купить ${abbreviateNumber(
                  count,
                )} 🧺! Увеличивай конкурсную ${this.locale.getEnum('морковку')}, сейчас твой лимит **${abbreviateNumber(
                  playerSlots,
                )}/${abbreviateNumber(maxSlots)}** 🧺`,
              );
            } else {
              this.embed.setDescription(
                `Тебе не хватает ${abbreviateNumber(
                  price * count - player.points,
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
