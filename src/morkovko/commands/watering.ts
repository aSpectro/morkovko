import { EmbedBuilder } from 'discord.js';
import * as moment from 'moment';
import { noUserEmbed, setEmbedAuthor, getTimeFromMins } from './helpers';

export default {
  name: 'полить',
  run: (message, args, service, isSlash) => {
    const embedSuccess = new EmbedBuilder()
      .setColor('#f97a50')
      .setDescription(`Морковка полита!`);

    const embedError = new EmbedBuilder()
      .setColor('#f97a50')
      .setDescription(`Не получилось полить морковку, попробуй позже!`);

    const embedErrorTime = new EmbedBuilder().setColor('#f97a50');
    const user = isSlash ? message.user : message.author;
    const send = async (a) => {
      if (isSlash) await message.reply(a).catch(() => console.log(''));
      else message.channel.send(a).catch(() => console.log(''));
    };
    service.checkUser(user.id).then((res) => {
      if (res.status === 200) {
        const d1 = moment(res.player.lastWateringDate);
        const d2 = moment(new Date());
        const diff = d2.diff(d1, 'minutes');
        const needDiff = 60;

        if (diff >= needDiff) {
          service.watering(res.player).then((resWatering) => {
            if (resWatering.status === 200) {
              send({
                embeds: [setEmbedAuthor(embedSuccess, user)],
              });
            } else {
              send({
                embeds: [setEmbedAuthor(embedError, user)],
              });
            }
          });
        } else {
          embedErrorTime.setDescription(
            `Ты сможешь полить морковку не раньше чем через ${getTimeFromMins(
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
