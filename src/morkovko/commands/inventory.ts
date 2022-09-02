import Command from './Command';
import { setEmbedAuthor, getCarrotLevel, getMaxSlots } from './helpers';
import { AppService } from './../../app.service';

export class InventoryCommand extends Command {
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
      service.checkUser(user.id).then((res) => {
        if (res.status === 200) {
          const player = res.player;
          const maxSlots = getMaxSlots(getCarrotLevel(player.carrotSize));
          const playerSlots = player.slotsCount;

          this.embed.setDescription(`**Инвентарь**\n
          Твой постоянный бонус прогресса **${player.progressBonus}**\n
          Пугало: ${
            player.hasPugalo ? '**есть**' : '**нет**'
          }\nАвтопокупка пугала: ${
            player.config.autoBuyPugalo ? '**активна**' : '**нет**'
          }\nДневной лимит подарков: **${player.dailyGiftCount}/3**`);
          this.embed.addFields(
            {
              name: 'Морковок',
              value: `🥕 ${player.carrotCount.toLocaleString()}`,
              inline: true,
            },
            {
              name: 'Очков улучшений',
              value: `🔸 ${player.points.toLocaleString()}`,
              inline: true,
            },
            {
              name: 'Горшков',
              value: `🧺 **${playerSlots}/${maxSlots}**`,
              inline: true,
            },
            {
              name: 'Звезд',
              value: `⭐ ${player.stars.toLocaleString()}`,
              inline: true,
            },
            {
              name: 'Бонус скорости роста',
              value: `📈 **${player.config.slotSpeedUpdate}%**`,
              inline: true,
            },
            {
              name: 'Бонус кулдауна свидания',
              value: `👨🏻‍🤝‍👨🏻 **${player.config.cooldowns.adate}%**`,
              inline: true,
            },
            {
              name: 'Бонус кулдауна полива',
              value: `💧 **${player.config.cooldowns.watering}%**`,
              inline: true,
            },
            {
              name: 'Бонус кулдауна молитвы',
              value: `🙏 **${player.config.cooldowns.pray}%**`,
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
