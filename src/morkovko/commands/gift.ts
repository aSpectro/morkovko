import Command from './Command';
import { setEmbedAuthor, getRelLevelName } from './helpers';
import { AppService } from './../../app.service';
import { WarsService } from 'src/wars.service';

export class GiftCommand extends Command {
  constructor(
    commandName: string,
    needEvents: boolean,
    warsService?: WarsService,
  ) {
    super(commandName, needEvents, warsService);
  }

  run(
    message: any,
    args: any,
    service: AppService,
    isSlash: boolean | undefined,
  ) {
    this.initCommand(message, args, service, isSlash, () => {
      const user = this.getUser();
      const userMention = this.getArgUser('игрок');
      service.checkUser(user.id).then((res) => {
        if (res.status === 200) {
          const { maxGiftCount } = this.config.bot.economy;
          const player = res.player;
          const count = this.getArgString('кол-во');
          if (
            userMention &&
            count &&
            userMention.id !== user.id &&
            player.carrotCount >= count &&
            count <= maxGiftCount &&
            player.dailyGiftCount > 0
          ) {
            service.checkUser(userMention.id).then((resMention) => {
              if (resMention.status === 200) {
                const playerMention = resMention.player;
                player.carrotCount -= count;
                playerMention.carrotCount += count;

                let level = 0;
                const levelBoost = Math.round((count / 5) * 2 + 1);

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

                player.dailyGiftCount -= 1;

                service.savePlayer(player).then((resSave) => {
                  if (resSave.status === 200) {
                    service.savePlayer(playerMention).then((resSaveMention) => {
                      if (resSaveMention.status === 200) {
                        this.embed.setDescription(
                          `Ты подарил <@${
                            playerMention.userId
                          }> ${count}🥕. Ваш уровень отношений повышен до ${level} очков - **${getRelLevelName(
                            level,
                          )}**`,
                        );
                        this.send({
                          embeds: [setEmbedAuthor(this.embed, user)],
                        });
                      } else {
                        this.embed.setDescription(
                          `Не получилось подарить 🥕. Попробуй позже.`,
                        );
                        this.send({
                          embeds: [setEmbedAuthor(this.embed, user)],
                        });
                      }
                    });
                  } else {
                    this.embed.setDescription(
                      `Не получилось подарить 🥕. Попробуй позже.`,
                    );
                    this.send({
                      embeds: [setEmbedAuthor(this.embed, user)],
                    });
                  }
                });
              } else {
                this.embed.setDescription(
                  'Похоже, что твой друг еще не открыл свою ферму!',
                );
                this.send({
                  embeds: [setEmbedAuthor(this.embed, user)],
                });
              }
            });
          } else {
            if (!userMention) {
              this.embed.setDescription('Ты не упомянул друга!');
              this.send({
                embeds: [setEmbedAuthor(this.embed, user)],
              });
            } else if (!count) {
              this.embed.setDescription('Ты не указал кол-во 🥕!');
              this.send({
                embeds: [setEmbedAuthor(this.embed, user)],
              });
            } else if (userMention.id === user.id || userMention.bot) {
              this.embed.setDescription('Нельзя подарить себе 🥕!');
              this.send({
                embeds: [setEmbedAuthor(this.embed, user)],
              });
            } else if (count > maxGiftCount) {
              this.embed.setDescription('Нельзя подарить больше 10 🥕 за раз!');
              this.send({
                embeds: [setEmbedAuthor(this.embed, user)],
              });
            } else if (player.dailyGiftCount === 0) {
              this.embed.setDescription(
                'Твой лимит подарков на сегодня исчерпан!',
              );
              this.send({
                embeds: [setEmbedAuthor(this.embed, user)],
              });
            } else {
              this.embed.setDescription('У тебя не хватает 🥕!');
              this.send({
                embeds: [setEmbedAuthor(this.embed, user)],
              });
            }
          }
        } else {
          this.replyNoUser(user);
        }
      });
    });
  }
}
