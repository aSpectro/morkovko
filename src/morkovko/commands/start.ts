import { EmbedBuilder } from 'discord.js';
import { setEmbedAuthor, randomIntFromInterval } from './helpers';
import config from '../config';

const carrotsLimit = config.bot.carrotsLimit;

export default {
  name: 'начать',
  run: (message, args, service, isSlash) => {
    const carrotNum = randomIntFromInterval(1, carrotsLimit);
    const embedSuccess = new EmbedBuilder()
      .setColor('#f97a50')
      .setDescription(
        `Поздравляю, ты открыл свою ферму морковок, сейчас у тебя один горшок, поливай его, чтобы скорее вырастить свою первую морковку!`,
      )
      .addFields({ name: '!помощь', value: 'Список команд', inline: true });

    const embedError = new EmbedBuilder()
      .setColor('#f97a50')
      .setDescription(`Ты уже в игре, чтобы начать заного надо выкти!`)
      .addFields({ name: '!выкти', value: 'Выкти из игры', inline: true });
    const user = isSlash ? message.user : message.author;
    const send = async (a) => {
      if (isSlash) await message.reply(a).catch(() => console.log(''));
      else message.channel.send(a).catch(() => console.log(''));
    };
    const player = {
      userId: user.id,
      carrotAvatar: `./outputs/carrots/${carrotNum}.png`,
      slots: [
        {
          progress: 0,
          factor: 0,
        },
      ],
    };
    service.createPlayer(player).then((res) => {
      if (res.status === 200) {
        send({ embeds: [setEmbedAuthor(embedSuccess, user)] });
      } else {
        send({ embeds: [setEmbedAuthor(embedError, user)] });
      }
    });
  },
};
