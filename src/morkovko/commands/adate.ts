import { EmbedBuilder } from 'discord.js';
import { noUserEmbed, setEmbedAuthor, getTimeFromMins } from './helpers';
import * as moment from 'moment';

export default {
  name: 'свидание',
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
        const d1 = moment(player.lastADate);
        const d2 = moment(new Date());
        const diff = d2.diff(d1, 'minutes');
        const needDiff = 1440;
        if (userFriends && userFriends.length > 0) {
          if (diff >= needDiff) {
            const successChance = Math.random() * 100;
            let isSuccess = false;
            if (successChance >= 10) isSuccess = true;
            const friend =
              userFriends[Math.floor(Math.random() * userFriends.length)];
            if (!isSuccess) player.carrotCount -= 1;

            const rels = player.relations.find(
              (f) => f.userId === friend.userId,
            );
            if (isSuccess) {
              rels.level += 10;
            } else {
              rels.level -= 30;
            }
            player.lastADate = moment(new Date()).toDate();

            service.savePlayer(player).then((resSave) => {
              if (resSave.status === 200) {
                service.checkUser(friend.userId).then((resFriend) => {
                  const friendModel = resFriend.player;
                  if (!isSuccess) friendModel.carrotCount -= 1;
                  if (resFriend.status === 200) {
                    const relsF = friendModel.relations.find(
                      (f) => f.userId === player.userId,
                    );
                    if (isSuccess) {
                      relsF.level += 10;
                    } else {
                      relsF.level -= 30;
                    }
                    service.savePlayer(friendModel).then((resSave) => {
                      if (resSave.status === 200) {
                        let noCarrot = '';
                        let friendNoCarrot = '';
                        if (player.carrotCount < 0) {
                          noCarrot =
                            ' т.к. у тебя не было морковки, ты взял кредит,';
                        }
                        if (friendModel.carrotCount < 0) {
                          friendNoCarrot =
                            'У твоего друга не было морковки, он взял кредит.';
                        }

                        let result = '';

                        if (isSuccess) {
                          result = `ваше свидание прошло успешно, вы получили по 10 очков отношений.`;
                        } else {
                          result = `ваше свидание прошло ужасно, вы так же потеряли по 30 очков отношений.`;
                        }

                        embedSuccess.setDescription(
                          `Ты сходил на свидание с <@${friendModel.userId}>, ${
                            !isSuccess ? 'вы потеряли по одной 🥕,' : ''
                          }${!isSuccess ? noCarrot : ''} ${result} ${
                            !isSuccess ? friendNoCarrot : ''
                          }`,
                        );
                        send({
                          embeds: [setEmbedAuthor(embedSuccess, user)],
                        });
                      } else {
                        embedError.setDescription(
                          `Не получилось сходить на свидание. Попробуй позже.`,
                        );
                        send({
                          embeds: [setEmbedAuthor(embedError, user)],
                        });
                      }
                    });
                  } else {
                    embedError.setDescription(
                      `Не получилось сходить на свидание. Попробуй позже.`,
                    );
                    send({
                      embeds: [setEmbedAuthor(embedError, user)],
                    });
                  }
                });
              } else {
                embedError.setDescription(
                  `Не получилось сходить на свидание. Попробуй позже.`,
                );
                send({
                  embeds: [setEmbedAuthor(embedError, user)],
                });
              }
            });
          } else {
            embedError.setDescription(
              `Ты сможешь сходить на свидание не раньше чем через ${getTimeFromMins(
                needDiff - diff,
              )}!`,
            );
            send({
              embeds: [setEmbedAuthor(embedError, user)],
            });
          }
        } else {
          embedError.setDescription(
            `У тебя нет друзей, чтобы сходить на свидание.`,
          );
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
