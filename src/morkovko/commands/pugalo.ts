import { EmbedBuilder } from 'discord.js';
import { noUserEmbed, setEmbedAuthor } from './helpers';

export default {
  name: 'пугало',
  run: (message, args, service, isSlash) => {
    const embedSuccess = new EmbedBuilder().setColor('#f97a50');
    const embedError = new EmbedBuilder().setColor('#f97a50');
    const user = isSlash ? message.user : message.author;
    const send = async (a) => {
      if (isSlash) await message.reply(a).catch(() => console.log(''));
      else message.channel.send(a).catch(() => console.log(''));
    };
    service.checkUser(user.id).then((res) => {
      if (res.status === 200) {
        const player = res.player;
        if (player.points >= 1 && !player.hasPugalo) {
          player.hasPugalo = true;
          player.points -= 1;
          service.savePlayer(player).then((resSave) => {
            if (resSave.status === 200) {
              embedSuccess.setDescription(
                `Ты купил пугало. Теперь твоя ферма защищена от мафии! Но не забывай что твой сосед ворует твое пугало в обед или полночь.`,
              );
              send({
                embeds: [setEmbedAuthor(embedSuccess, user)],
              });
            } else {
              embedError.setDescription(
                `Не получилось купить пугало. Попробуй позже.`,
              );
              send({
                embeds: [setEmbedAuthor(embedError, user)],
              });
            }
          });
        } else {
          if (player.hasPugalo) {
            embedError.setDescription(`У тебя уже есть пугало!`);
          } else {
            embedError.setDescription(
              `Тебе не хватает ${1 - player.points}🔸!`,
            );
          }
          send({
            embeds: [setEmbedAuthor(embedError, user)],
          });
        }
      } else {
        send({ embeds: [noUserEmbed(user)] });
      }
    });
  },
};
