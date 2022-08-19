import { EmbedBuilder, AttachmentBuilder } from 'discord.js';
import { createCanvas, loadImage } from 'canvas';
import { noUserEmbed, setEmbedAuthor } from './helpers';

export default {
  name: 'морковка',
  run: (message, args, service, isSlash) => {
    const embedSuccess = new EmbedBuilder().setColor('#f97a50');
    const embedError = new EmbedBuilder().setColor('#f97a50');
    const user = isSlash ? message.user : message.author;
    const send = async (a) => {
      if (isSlash) await message.reply(a).catch(() => console.log(''));
      else message.channel.send(a).catch(() => console.log(''));
    };
    service.checkUser(user.id).then(async (res) => {
      if (res.status === 200) {
        const player = res.player;
        const canvas = createCanvas(256, 256);
        const ctx = canvas.getContext('2d');
        const carrot = await loadImage(player.carrotAvatar);
        ctx.drawImage(carrot, 0, 0, 256, 256);
        const attachment = new AttachmentBuilder(canvas.toBuffer('image/png'), {
          name: 'carrot.png',
        });

        if (carrot) {
          embedSuccess.setDescription(
            `Размер морковки **${player.carrotSize.toLocaleString()}** см`,
          );
          send({
            embeds: [setEmbedAuthor(embedSuccess, user)],
            files: [attachment],
          });
        }
      } else {
        send({ embeds: [noUserEmbed(user)] });
      }
    });
  },
};
