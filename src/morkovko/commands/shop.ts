import Command from './Command';
import { setEmbedAuthor, getCarrotLevel, getMaxSlots } from './helpers';
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
          const playerSlots = player.slotsCount;
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
              value: `**${playerSlots}/${maxSlots}** Купить горшок за ${this.getPrice(
                playerSlots,
                slot,
              )} 🔸.`,
              inline: true,
            },
            {
              name: '!увеличить',
              value: `Увеличить конкурсную морковку за **${this.getPrice(
                playerSlots,
                upgrade,
              )}🔸** на 1см. **!увеличить <кол-во>**`,
              inline: true,
            },
            {
              name: '!пугало',
              value: `Купить пугало за ${this.getPrice(
                playerSlots,
                pugalo,
              )} 🔸, которое отпугивает мафию, но в обед и полночь ваш сосед ворует ваше пугало`,
              inline: true,
            },
          );

          if (
            player.carrotSize >=
            this.config.bot.economy.shopRules.slotSpeedUpdate
          ) {
            this.embed.addFields({
              name: '!скорость-роста',
              value: `Увеличить скорость роста морковок на **1%** за ${this.getPrice(
                playerSlots,
                slotSpeedUpdate,
              )} 🔸.`,
              inline: true,
            });
          }

          if (
            player.carrotSize >= this.config.bot.economy.shopRules.autoBuyPugalo
          ) {
            this.embed.addFields({
              name: '!автопокупка-пугала',
              value: `Купить автопокупку пугала за ${this.getPrice(
                playerSlots,
                autoBuyPugalo,
              )} 🔸. Пугало будет покупаться автоматически при наличии необходимого кол-ва 🔸 на счету.`,
              inline: true,
            });
          }

          if (
            player.carrotSize >= this.config.bot.economy.shopRules.cooldowns
          ) {
            this.embed.addFields(
              {
                name: '!кулдаун-свидание',
                value: `Уменьшить кулдаун свидания за ${this.getPrice(
                  playerSlots,
                  cooldowns.adate,
                )} 🔸 на **1%**.`,
                inline: true,
              },
              {
                name: '!кулдаун-полив',
                value: `Уменьшить кулдаун полива за ${this.getPrice(
                  playerSlots,
                  cooldowns.watering,
                )} 🔸 на **1%**.`,
                inline: true,
              },
              {
                name: '!кулдаун-молитва',
                value: `Уменьшить кулдаун молитвы за ${this.getPrice(
                  playerSlots,
                  cooldowns.pray,
                )} 🔸 на **1%**.`,
                inline: true,
              },
            );
          }
          this.send({ embeds: [setEmbedAuthor(this.embed, user)] });
        } else {
          this.replyNoUser(user);
        }
      });
    });
  }
}
