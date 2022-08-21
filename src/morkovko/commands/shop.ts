import { EmbedBuilder } from 'discord.js';
import { noUserEmbed, setEmbedAuthor, calcPrice } from './helpers';
import config from '../config';

const { pugalo, slot, upgrade } = config.bot.economy;

export default {
  name: 'магазин',
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
        const playerSlots = player.slots.length;
        embedSuccess.setDescription(`Морковок: **🥕 ${player.carrotCount.toLocaleString()}**\n
        Очков улучшений: **🔸 ${player.points.toLocaleString()}**`);
        embedSuccess.addFields(
          {
            name: '!продать',
            value: `Продать морковки за 🔸. **!продать <кол-во>**`,
            inline: true,
          },
          {
            name: '!купить',
            value: `Купить горшок за ${calcPrice(playerSlots, slot)} 🔸.`,
            inline: true,
          },
          {
            name: '!увеличить',
            value: `Увеличить конкурсную морковку за **${calcPrice(
              playerSlots,
              upgrade,
            )}🔸** на 1см. **!увеличить <кол-во>**`,
            inline: true,
          },
          {
            name: '!пугало',
            value: `Купить пугало за ${calcPrice(
              playerSlots,
              pugalo,
            )} 🔸, которое отпугивает мафию, но в обед и полночь ваш сосед ворует ваше пугало`,
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
