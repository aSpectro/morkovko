import { EmbedBuilder } from 'discord.js';
import * as moment from 'moment';
import { noUserEmbed, setEmbedAuthor, getTimeFromMins } from './helpers';

const counts = [5, 10, 15, 20];

export default {
  name: 'помолиться',
  run: (message, args, service, isSlash) => {
    const embedSuccess = new EmbedBuilder().setColor('#f97a50');
    const embedError = new EmbedBuilder().setColor('#f97a50');
    const embedErrorTime = new EmbedBuilder().setColor('#f97a50');
    const user = isSlash ? message.user : message.author;
    const send = async (a) => {
      if (isSlash) await message.reply(a).catch(() => console.log(''));
      else message.channel.send(a).catch(() => console.log(''));
    };
    service.checkUser(user.id).then((res) => {
      if (res.status === 200) {
        const player = res.player;
        const d1 = moment(player.lastPrayDate);
        const d2 = moment(new Date());
        const diff = d2.diff(d1, 'minutes');
        const needDiff = 1440;

        if (diff >= needDiff) {
          player.lastPrayDate = moment(new Date()).toDate();
          player.carrotCount +=
            counts[Math.floor(Math.random() * counts.length)];
          service.savePlayer(player).then((resSave) => {
            if (resSave.status === 200) {
              embedSuccess.setDescription(
                `Святая подарила тебе ${player.carrotCount}🥕 за молитву!`,
              );
              send({
                embeds: [setEmbedAuthor(embedSuccess, user)],
              });
            } else {
              embedError.setDescription(
                `Не получилось помолиться. Попробуй позже.`,
              );
              send({
                embeds: [setEmbedAuthor(embedError, user)],
              });
            }
          });
        } else {
          embedErrorTime.setDescription(
            `Ты сможешь помолиться не раньше чем через ${getTimeFromMins(
              needDiff - diff,
            )}!`,
          );
          send({
            embeds: [setEmbedAuthor(embedErrorTime, user)],
          });
        }
      } else {
        send({ embeds: [noUserEmbed(user)] });
      }
    });
  },
};
