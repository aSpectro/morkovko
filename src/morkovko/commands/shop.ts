import Command from './Command';
import {
  setEmbedAuthor,
  getCarrotLevel,
  getMaxSlots,
  abbreviateNumber,
} from './helpers';
import { AppService } from './../../app.service';
import { WarsService } from 'src/wars.service';

export class ShopCommand extends Command {
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
          this.embed.setDescription(`Морковок: **🥕 ${abbreviateNumber(
            player.carrotCount,
          )}**\n
          Очков улучшений: **🔸 ${abbreviateNumber(player.points)}**`);

          this.embed.addFields(
            {
              name: '!продать',
              value: `Продать морковки за 🔸. **!продать <кол-во>**`,
              inline: true,
            },
            {
              name: '!купить',
              value: `**${abbreviateNumber(playerSlots)}/${abbreviateNumber(
                maxSlots,
              )}** Купить горшок за ${abbreviateNumber(
                this.getPrice(playerSlots, slot),
              )} 🔸.`,
              inline: true,
            },
            {
              name: '!увеличить',
              value: `Увеличить конкурсную морковку за **${abbreviateNumber(
                this.getPrice(playerSlots, upgrade),
              )}🔸** на 1см. **!увеличить <кол-во>**`,
              inline: true,
            },
            {
              name: '!пугало',
              value: `Купить пугало за ${abbreviateNumber(
                this.getPrice(playerSlots, pugalo),
              )} 🔸, которое отпугивает мафию, но в обед и полночь ваш сосед ворует ваше пугало`,
              inline: true,
            },
          );

          if (
            player.carrotSize >=
              this.config.bot.economy.shopRules.slotSpeedUpdate &&
            this.canBuy(
              player.carrotSize,
              'slotSpeedUpdate',
              player.config.slotSpeedUpdate,
            )
          ) {
            this.embed.addFields({
              name: '!скорость-роста',
              value: `Увеличить скорость роста морковок на **1%** за ${abbreviateNumber(
                this.getPrice(playerSlots, slotSpeedUpdate),
              )} 🔸.`,
              inline: true,
            });
          }

          if (
            player.carrotSize >=
              this.config.bot.economy.shopRules.autoBuyPugalo &&
            this.canBuy(player.carrotSize, 'autoBuyPugalo', 1)
          ) {
            this.embed.addFields({
              name: '!автопокупка-пугала',
              value: `Купить автопокупку пугала за ${abbreviateNumber(
                this.getPrice(playerSlots, autoBuyPugalo),
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
                value: `Уменьшить кулдаун свидания за ${abbreviateNumber(
                  this.getPrice(playerSlots, cooldowns.adate),
                )} 🔸 на **1%**.`,
                inline: true,
              },
              {
                name: '!кулдаун-полив',
                value: `Уменьшить кулдаун полива за ${abbreviateNumber(
                  this.getPrice(playerSlots, cooldowns.watering),
                )} 🔸 на **1%**.`,
                inline: true,
              },
              {
                name: '!кулдаун-молитва',
                value: `Уменьшить кулдаун молитвы за ${abbreviateNumber(
                  this.getPrice(playerSlots, cooldowns.pray),
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
