import { EmbedBuilder } from 'discord.js';
import { noUserEmbed, setEmbedAuthor, getCarrotLevel, getMaxSlots } from './helpers';
import config from '../config';
const { slot } = config.bot.economy;

export default {
  name: 'купить',
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
        const price = slot;
        const maxSlots = getMaxSlots(getCarrotLevel(player.carrotSize));
        const playerSlots = player.slots.length;
        const count = isSlash
          ? Math.abs(parseInt(args.getString('кол-во')))
          : Math.abs(parseInt(args[0]));
        if (
          count &&
          player.points >= count * price &&
          playerSlots + count <= maxSlots
        ) {
          for (let i = 0; i < count; i++) {
            player.slots.push({
              progress: 0,
              factor: 0,
            });
          }
          player.points -= price * count;
          service.savePlayer(player).then((resSave) => {
            if (resSave.status === 200) {
              embedSuccess.setDescription(
                `Ты купил ${count}🧺. Теперь у тебя **${player.slots.length}** 🧺!`,
              );
              send({
                embeds: [setEmbedAuthor(embedSuccess, user)],
              });
            } else {
              embedError.setDescription(
                `Не получилось купить горшок. Попробуй позже.`,
              );
              send({
                embeds: [setEmbedAuthor(embedError, user)],
              });
            }
          });
        } else {
          if (!count) {
            embedError.setDescription(`Ты не указал кол-во 🧺!`);
          } else if (playerSlots + count > maxSlots) {
            embedError.setDescription(
              `Ты не можешь купить ${count} 🧺! Увеличивай конкурсную морковку, сейчас твой лимит ${playerSlots}/${maxSlots} 🧺`,
            );
          } else {
            embedError.setDescription(
              `Тебе не хватает ${price * count - player.points}🔸!`,
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
