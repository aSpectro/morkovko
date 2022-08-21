import { EmbedBuilder } from 'discord.js';
import { noUserEmbed, setEmbedAuthor } from './helpers';

export default {
  name: 'продать',
  run: (message, args, service, isSlash) => {
    const embedSuccess = new EmbedBuilder().setColor('#f97a50');
    const embedError = new EmbedBuilder().setColor('#f97a50');
    const user = isSlash ? message.user : message.author;
    const send = async (a) => {
      if (isSlash) await message.reply(a).catch(() => console.log(''));
      else message.channel.send(a).catch(() => console.log(''));
    };

    const grabChance = Math.random() * 100;
    let grab = false;
    if (grabChance <= 5) grab = true;

    service.checkUser(user.id).then((res) => {
      if (res.status === 200) {
        const player = res.player;
        const count = isSlash
          ? Math.abs(parseInt(args.getString('кол-во')))
          : Math.abs(parseInt(args[0]));
        if (count && player.carrotCount >= count) {
          if (player.carrotCount === 1) grab = false;
          player.carrotCount -= count;
          const grabCount = grab ? Math.floor(count / 2) : count;
          player.points += grab
            ? count - (grabCount === 0 ? 1 : grabCount)
            : count;
          service.savePlayer(player).then((resSave) => {
            if (resSave.status === 200) {
              if (grab) {
                embedSuccess.setDescription(
                  `Во время продажи тебя кто-то увидел и позвонил в налоговую, у тебя изъяли ${
                    grabCount === 0 ? 1 : grabCount
                  }🥕 в счет фонда борьбы с моррупцией. Ты смог продать ${
                    count - grabCount
                  }🥕. Теперь у тебя на счету ${player.points}🔸`,
                );
              } else {
                embedSuccess.setDescription(
                  `Ты продал ${count}🥕. Теперь у тебя на счету ${player.points}🔸`,
                );
              }
              send({
                embeds: [setEmbedAuthor(embedSuccess, user)],
              });
            } else {
              embedError.setDescription(
                `Не получилось продать 🥕. Попробуй позже.`,
              );
              send({
                embeds: [setEmbedAuthor(embedError, user)],
              });
            }
          });
        } else {
          if (!count) {
            embedError.setDescription(`Ты не указал кол-во 🥕!`);
          } else {
            embedError.setDescription(
              `Тебе не хватает ${count - player.carrotCount}🥕!`,
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
