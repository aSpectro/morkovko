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
      const {
        pugalo,
        slot,
        upgrade,
        slotSpeedUpdate,
        autoBuyPugalo,
        cooldowns,
      } = this.config.bot.economy;
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
            {
              name: '!скорость-роста',
              value: `Увеличить скорость роста морковок на **1%** за ${slotSpeedUpdate} 🔸.`,
              inline: true,
            },
            {
              name: '!автопокупка-пугала',
              value: `Купить автопокупку пугала за ${autoBuyPugalo} 🔸. Пугало будет покупаться автоматически при наличии необходимого кол-ва 🔸 на счету.`,
              inline: true,
            },
            {
              name: '!кулдаун-свидание',
              value: `Уменьшить кулдаун свидания за ${cooldowns.adate} 🔸 на **1%**.`,
              inline: true,
            },
            {
              name: '!кулдаун-полив',
              value: `Уменьшить кулдаун полива за ${cooldowns.watering} 🔸 на **1%**.`,
              inline: true,
            },
            {
              name: '!кулдаун-молитва',
              value: `Уменьшить кулдаун молитвы за ${cooldowns.pray} 🔸 на **1%**.`,
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
