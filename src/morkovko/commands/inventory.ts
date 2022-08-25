import Command from './Command';
import {
  setEmbedAuthor,
  calcTime,
  getCarrotLevel,
  getMaxSlots,
} from './helpers';
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
          const playerSlots = player.slots.length;

          let maxProgress = player.slots[0];
          for (const slot of player.slots) {
            if (slot.progress > maxProgress.progress) {
              maxProgress = slot;
            } else if (
              slot.progress === maxProgress.progress &&
              slot.factor > maxProgress.factor
            ) {
              maxProgress = slot;
            }
          }
          const p = Math.round(maxProgress.progress);
          this.embed.setDescription(`Твой инвентарь\n
          Ближайшая к созреванию морковка: **${p}%**. Осталось примерно **${calcTime(
            maxProgress.progress,
            maxProgress.factor,
            this.config.bot.hourProgress,
          )}ч.**\nПугало: ${player.hasPugalo ? '**есть**' : '**нет**'}`);
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
          );
          this.send({ embeds: [setEmbedAuthor(this.embed, user)] });
        } else {
          this.replyNoUser(user);
        }
      });
    });
  }
}
