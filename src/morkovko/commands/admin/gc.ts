import { EmbedBuilder } from 'discord.js';
import { setEmbedAuthor, randomIntFromInterval } from './../helpers';
import config from '../../config';

export default {
  name: 'gc',
  run: (message, args, service, isSlash) => {
    const user = isSlash ? message.user : message.author;
    const userMention = isSlash
      ? args.getUser('игрок')
      : message.mentions.users.first();
    const count = isSlash
      ? parseInt(args.getString('кол-во'))
      : parseInt(args[0]);
    if (user.id === config.admin) {
      service.giveCarrots(userMention.id, count);
    }
  },
};
