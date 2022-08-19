import { EmbedBuilder } from 'discord.js';
import * as moment from 'moment';
import {
  noUserEmbed,
  setEmbedAuthor,
  getTimeFromMins,
  calcTime,
} from './helpers';
import config from '../config';

const hourProgress = config.bot.hourProgress;

export default {
  name: 'инфо',
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
        const d1 = moment(player.lastWateringDate);
        const d2 = moment(new Date());
        const diff = d2.diff(d1, 'minutes');
        const needDiff = 60;

        const d1Pray = moment(player.lastPrayDate);
        const d2Pray = moment(new Date());
        const diffPray = d2Pray.diff(d1Pray, 'minutes');
        const needDiffPray = 1440;

        const d1A = moment(player.lastADate);
        const d2A = moment(new Date());
        const diffA = d2A.diff(d1A, 'minutes');
        const needDiffA = 1440;

        let watering = '';
        let pray = '';
        let carrot = '';
        let adate = '';

        if (diff >= needDiff) {
          watering = '💧 Полив морковки доступен.\n';
        } else {
          watering = `💧 Ты сможешь полить морковку не раньше чем через ${getTimeFromMins(
            needDiff - diff,
          )}\n`;
        }

        if (diffPray >= needDiffPray) {
          pray = '🙏 Молитва доступна.\n';
        } else {
          pray = `🙏 Ты сможешь помолиться не раньше чем через ${getTimeFromMins(
            needDiffPray - diffPray,
          )}\n`;
        }

        if (diffA >= needDiffA) {
          adate = '👨🏻‍🤝‍👨🏻 Свидание доступно.\n';
        } else {
          adate = `👨🏻‍🤝‍👨🏻 Ты сможешь сходить на свидание не раньше чем через ${getTimeFromMins(
            needDiffA - diffA,
          )}\n`;
        }

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
        carrot = `📈 Ближайшая к созреванию морковка: **${p}%**. Осталось примерно **${calcTime(
          maxProgress.progress,
          maxProgress.factor,
          hourProgress,
        )}ч.**`;

        embedSuccess.setDescription(`${watering + pray + adate + carrot}`);
        send({ embeds: [setEmbedAuthor(embedSuccess, user)] });
      } else {
        send({ embeds: [noUserEmbed(user)] });
      }
    });
  },
};
