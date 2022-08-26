import Command from './Command';
import {
  setEmbedAuthor,
  calcPrice,
  getCarrotLevel,
  getMaxSlots,
} from './helpers';
import { AppService } from './../../app.service';

export class ShopCommand extends Command {
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
      const { pugalo, slot, upgrade } = this.config.bot.economy;
      service.checkUser(user.id).then((res) => {
        if (res.status === 200) {
          const player = res.player;
          const carrotLevel = getCarrotLevel(player.carrotSize);
          const maxSlots = getMaxSlots(carrotLevel);
          const playerSlots = player.slots.length;
          this.embed
            .setDescription(`Морковок: **🥕 ${player.carrotCount.toLocaleString()}**\n
          Очков улучшений: **🔸 ${player.points.toLocaleString()}**`);
          this.embed.addFields(
            {
              name: '!продать',
              value: `Продать морковки за 🔸. **!продать <кол-во>**`,
              inline: true,
            },
            {
              name: '!купить',
              value: `**${playerSlots}/${maxSlots}** Купить горшок за ${slot} 🔸.`,
              inline: true,
            },
            {
              name: '!увеличить',
              value: `Увеличить конкурсную морковку за **${calcPrice(
                player.slots.length,
                upgrade,
              )}🔸** на 1см. **!увеличить <кол-во>**`,
              inline: true,
            },
            {
              name: '!пугало',
              value: `Купить пугало за ${pugalo} 🔸, которое отпугивает мафию, но в обед и полночь ваш сосед ворует ваше пугало`,
              inline: true,
            },
          );
          this.send({ embeds: [setEmbedAuthor(this.embed, user)] });
        } else {
          this.replyNoUser(user);
        }
      });
    });
  }
}
