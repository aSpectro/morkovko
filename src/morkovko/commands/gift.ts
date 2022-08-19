import { EmbedBuilder } from 'discord.js';
import { noUserEmbed, setEmbedAuthor, getRelLevelName } from './helpers';

const levelsCount = [1, 2, 3];

export default {
  name: 'подарить',
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
        const count = isSlash
          ? Math.abs(parseInt(args.getString('кол-во')))
          : Math.abs(parseInt(args[0]));
        if (
          userMention &&
          count &&
          userMention.id !== user.id &&
          player.carrotCount >= count
        ) {
          service.checkUser(userMention.id).then((resMention) => {
            if (resMention.status === 200) {
              const playerMention = resMention.player;
              player.carrotCount -= count;
              playerMention.carrotCount += count;

              let level = 0;
              const levelBoost =
                levelsCount[Math.floor(Math.random() * levelsCount.length)];

              if (player.relations) {
                const relUser = player.relations.find(
                  (f) => f.userId === playerMention.userId,
                );

                if (relUser) {
                  relUser.level += levelBoost;
                } else {
                  player.relations.push({
                    userId: playerMention.userId,
                    level: levelBoost,
                  });
                }
              } else {
                player.relations = [
                  {
                    userId: playerMention.userId,
                    level: levelBoost,
                  },
                ];
              }

              if (playerMention.relations) {
                const relUser = playerMention.relations.find(
                  (f) => f.userId === player.userId,
                );

                if (relUser) {
                  relUser.level += levelBoost;
                } else {
                  playerMention.relations.push({
                    userId: player.userId,
                    level: levelBoost,
                  });
                }
              } else {
                playerMention.relations = [
                  {
                    userId: player.userId,
                    level: levelBoost,
                  },
                ];
              }

              level = player.relations.find(
                (f) => f.userId === playerMention.userId,
              ).level;

              service.savePlayer(player).then((resSave) => {
                if (resSave.status === 200) {
                  service.savePlayer(playerMention).then((resSaveMention) => {
                    if (resSaveMention.status === 200) {
                      embedSuccess.setDescription(
                        `Ты подарил <@${
                          playerMention.userId
                        }> ${count}🥕. Ваш уровень отношений повышен до ${level} очков - **${getRelLevelName(
                          level,
                        )}**`,
                      );
                      send({
                        embeds: [setEmbedAuthor(embedSuccess, user)],
                      });
                    } else {
                      embedError.setDescription(
                        `Не получилось подарить 🥕. Попробуй позже.`,
                      );
                      send({
                        embeds: [setEmbedAuthor(embedError, user)],
                      });
                    }
                  });
                } else {
                  embedError.setDescription(
                    `Не получилось подарить 🥕. Попробуй позже.`,
                  );
                  send({
                    embeds: [setEmbedAuthor(embedError, user)],
                  });
                }
              });
            } else {
              embedError.setDescription(
                'Похоже, что твой друг еще не открыл свою ферму!',
              );
              send({
                embeds: [setEmbedAuthor(embedError, user)],
              });
            }
          });
        } else {
          if (!userMention) {
            embedError.setDescription('Ты не упомянул друга!');
            send({
              embeds: [setEmbedAuthor(embedError, user)],
            });
          } else if (!count) {
            embedError.setDescription('Ты не указал кол-во 🥕!');
            send({
              embeds: [setEmbedAuthor(embedError, user)],
            });
          } else if (userMention.id === user.id || userMention.bot) {
            embedError.setDescription('Нельзя подарить себе 🥕!');
            send({
              embeds: [setEmbedAuthor(embedError, user)],
            });
          } else {
            embedError.setDescription('У тебя не хватает 🥕!');
            send({
              embeds: [setEmbedAuthor(embedError, user)],
            });
          }
        }
      } else {
        send({ embeds: [noUserEmbed(user)] });
      }
    });
  },
};
