import { EmbedBuilder } from 'discord.js';
import { noUserEmbed, setEmbedAuthor } from './helpers';

export default {
  name: 'выкти',
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
        const userFriends = player.relations;
        if (userFriends && userFriends.length > 0) {
          const mentions = userFriends.map((m) => `<@${m.userId}>`).join(' ');
          send(`${mentions} Ваш друг хочет выкти, подарите ему морковок!`);
        } else {
          embedError.setDescription(`У тебя нет друзей, чтобы выкти.`);
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
