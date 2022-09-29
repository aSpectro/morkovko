import Command from './Command';
import {
  setEmbedAuthor,
  getCarrotLevel,
  getMaxSlots,
  abbreviateNumber,
} from './helpers';
import { AppService } from './../../app.service';
import { WarsService } from 'src/wars.service';

export class InventoryCommand extends Command {
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
      service.checkUser(user.id).then(async (res) => {
        if (res.status === 200) {
          const player = res.player;
          const maxSlots = getMaxSlots(getCarrotLevel(player.carrotSize));
          const playerSlots = player.slotsCount;
          const neighbours = await this.service.getUserNeighbours(user.id);
          let neighboursString = 'у тебя нет соседей';
          if (neighbours.data.length > 0) {
            neighboursString = neighbours.data
              .map((m) => `<@${m.userId}>`)
              .join(', ');
          }

          const debuffs = player.config.debuffs;

          this.embed.setDescription(`**Инвентарь**\n
          Твой постоянный бонус прогресса **${
            player.progressBonus
          }**\nТвои соседи на ферме: ${neighboursString}\n
          Пугало: ${
            player.hasPugalo ? '**есть**' : '**нет**'
          }\nАвтопокупка пугала: ${
            player.config.autoBuyPugalo ? '**активна**' : '**нет**'
          }\nДневной лимит подарков: **${
            player.dailyGiftCount
          }/3**\nДебафы: **${debuffs ? debuffs : 0}**`);
          this.embed.addFields(
            {
              name: 'Морковок',
              value: `🥕 ${abbreviateNumber(player.carrotCount)}`,
              inline: true,
            },
            {
              name: 'Очков улучшений',
              value: `🔸 ${abbreviateNumber(player.points)}`,
              inline: true,
            },
            {
              name: 'Горшков',
              value: `🧺 **${abbreviateNumber(playerSlots)}/${abbreviateNumber(
                maxSlots,
              )}**`,
              inline: true,
            },
            {
              name: 'Звезд',
              value: `⭐ ${abbreviateNumber(player.stars)}`,
              inline: true,
            },
            {
              name: 'Бонус скорости роста',
              value: `📈 **${player.config.slotSpeedUpdate}%/50%**`,
              inline: true,
            },
            {
              name: 'Бонус кулдауна свидания',
              value: `👨🏻‍🤝‍👨🏻 **${player.config.cooldowns.adate}%/50%**`,
              inline: true,
            },
            {
              name: 'Бонус кулдауна полива',
              value: `💧 **${player.config.cooldowns.watering}%/50%**`,
              inline: true,
            },
            {
              name: 'Бонус кулдауна молитвы',
              value: `🙏 **${player.config.cooldowns.pray}%/50%**`,
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
