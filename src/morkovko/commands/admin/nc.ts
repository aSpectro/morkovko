import { EmbedBuilder } from 'discord.js';
import { setEmbedAuthor, randomIntFromInterval } from './../helpers';
import config from '../../config';

export default {
  name: 'nc',
  run: (message, args, service, isSlash) => {
    const user = isSlash ? message.user : message.author;
    if (user.id === config.admin) {
      service.nullCarrots();
    }
  },
};
