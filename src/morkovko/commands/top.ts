import { EmbedBuilder } from 'discord.js';
import { noUserEmbed, setEmbedAuthor } from './helpers';

export default {
  name: 'топ',
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

        service.getUsersTop().then(async (resTop) => {
          if (resTop.status === 200) {
            const userRate = resTop.data.findIndex(
              (f) => f.userId === player.userId,
            );
            embedSuccess.setDescription(
              `Твое место в рейтинге **${
                userRate + 1
              }**! Размер морковки **${player.carrotSize.toLocaleString()}** см`,
            );

            const data = resTop.data.slice(0, 4);
            const reqs = [];

            for (let i = 0; i < data.length; i++) {
              const u = resTop.data[i];
              const req = await service.getUsername(u.userId);
              reqs.push(req);
            }
            Promise.all([...reqs]).then((resData) => {
              for (let i = 0; i < resData.length; i++) {
                const field = {
                  nickname: resData[i].username,
                  size: resTop.data[i].carrotSize,
                };
                embedSuccess.addFields({
                  name: `${i + 1}. ${field.nickname}`,
                  value: `Размер морковки **${field.size.toLocaleString()}** см`,
                });
              }
              send({
                embeds: [setEmbedAuthor(embedSuccess, user)],
              });
            });
          } else {
            embedError.setDescription(
              `Не получилось получить рейтинг. Попробуй позже.`,
            );
            send({
              embeds: [setEmbedAuthor(embedError, user)],
            });
          }
        });
      } else {
        send({ embeds: [noUserEmbed(user)] });
      }
    });
  },
};
