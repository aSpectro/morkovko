import { EmbedBuilder } from 'discord.js';
import { noUserEmbed, setEmbedAuthor, calcTime } from './helpers';
import config from '../config';

const hourProgress = config.bot.hourProgress;

export default {
  name: 'инвентарь',
  run: (message, args, service, isSlash) => {
    const embedSuccess = new EmbedBuilder().setColor('#f97a50');
    const user = isSlash ? message.user : message.author;
    const send = async (a) => {
      if (isSlash) await message.reply(a).catch(() => console.log(''));
      else message.channel.send(a).catch(() => console.log(''));
    };
    service.checkUser(user.id).then((res) => {
      if (res.status === 200) {
        const player = res.player;

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
        embedSuccess.setDescription(`Твой инвентарь\n
        Ближайшая к созреванию морковка: **${p}%**. Осталось примерно **${calcTime(
          maxProgress.progress,
          maxProgress.factor,
          hourProgress,
        )}ч.**\nПугало: ${player.hasPugalo ? '**есть**' : '**нет**'}`);
        embedSuccess.addFields(
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
            value: `🧺 ${player.slots.length.toLocaleString()}`,
            inline: true,
          },
        );
        send({ embeds: [setEmbedAuthor(embedSuccess, user)] });
      } else {
        send({ embeds: [noUserEmbed(user)] });
      }
    });
  },
};
