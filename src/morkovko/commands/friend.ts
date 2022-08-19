import { EmbedBuilder, AttachmentBuilder } from 'discord.js';
import { noUserEmbed, setEmbedAuthor, getRelLevelName } from './helpers';
import { createCanvas, loadImage } from 'canvas';

export default {
  name: 'игрок',
  run: (message, args, service, isSlash) => {
    const embedSuccess = new EmbedBuilder().setColor('#f97a50');
    const embedError = new EmbedBuilder().setColor('#f97a50');
    const user = isSlash ? message.user : message.author;
    const userMention = isSlash
      ? args.getUser('игрок')
      : message.mentions.users.first();
    const send = async (a) => {
      if (isSlash) await message.reply(a).catch(() => console.log(''));
      else message.channel.send(a).catch(() => console.log(''));
    };
    service.checkUser(user.id).then((res) => {
      if (res.status === 200) {
        const player = res.player;
        if (userMention && userMention.id !== user.id) {
          service.checkUser(userMention.id).then(async (resMention) => {
            if (resMention.status === 200) {
              const playerMention = resMention.player;
              const canvas = createCanvas(256, 256);
              const ctx = canvas.getContext('2d');
              const carrot = await loadImage(playerMention.carrotAvatar);
              ctx.drawImage(carrot, 0, 0, 256, 256);
              const attachment = new AttachmentBuilder(
                canvas.toBuffer('image/png'),
                {
                  name: 'carrot.png',
                },
              );

              if (carrot) {
                let relations = '';
                const friendRelations = player.relations
                  ? player.relations.find((f) => f.userId === userMention.id)
                  : false;

                if (friendRelations) {
                  relations = `Ваши отношения ${
                    friendRelations.level
                  } очков - **${getRelLevelName(friendRelations.level)}**.`;
                } else {
                  relations = 'Вы еще не знакомы с этим игроком.';
                }

                embedSuccess.setDescription(
                  `**${
                    userMention.username
                  }**\nРазмер морковки **${playerMention.carrotSize.toLocaleString()}** см.\n${relations}`,
                );
                send({
                  embeds: [setEmbedAuthor(embedSuccess, user)],
                  files: [attachment],
                });
              }
            } else {
              embedError.setDescription(
                'Похоже, что он еще не открыл свою ферму!',
              );
              send({
                embeds: [setEmbedAuthor(embedError, user)],
              });
            }
          });
        } else {
          embedError.setDescription('Ты не упомянул игрока!');
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
