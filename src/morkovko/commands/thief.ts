import Command from './Command';
import { setEmbedAuthor } from './helpers';
import { AppService } from './../../app.service';

export class ThiefCommand extends Command {
  constructor(commandName: string) {
    super(commandName);
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
      const { thief, fine } = this.config.bot.economy.stars;
      service.checkUser(user.id).then(async (res) => {
        if (res.status === 200 && res.player) {
          const player = res.player;
          const price = thief;
          if (
            userMention &&
            player.stars >= price &&
            !player.config.stars.isThief &&
            userMention.id !== user.id
          ) {
            const neighbours = await this.service.getUserNeighbours(user.id);
            const neighbour = neighbours.data.find(
              (f) => f.userId === userMention.id,
            );
            if (neighbour) {
              service.checkUser(userMention.id).then(async (resMention) => {
                if (resMention.status === 200) {
                  const playerMention = resMention.player;
                  if (playerMention.hasPugalo) {
                    player.config.stars.isThief = true;
                    player.stars -= price;
                    playerMention.hasPugalo = false;

                    if (player.relations) {
                      const relUser = player.relations.find(
                        (f) => f.userId === playerMention.userId,
                      );

                      if (relUser) {
                        relUser.level -= fine;
                      } else {
                        player.relations.push({
                          userId: playerMention.userId,
                          level: -fine,
                        });
                      }
                    } else {
                      player.relations = [
                        {
                          userId: playerMention.userId,
                          level: -fine,
                        },
                      ];
                    }

                    if (playerMention.relations) {
                      const relUser = playerMention.relations.find(
                        (f) => f.userId === player.userId,
                      );

                      if (relUser) {
                        relUser.level -= fine;
                      } else {
                        playerMention.relations.push({
                          userId: player.userId,
                          level: -fine,
                        });
                      }
                    } else {
                      playerMention.relations = [
                        {
                          userId: player.userId,
                          level: -fine,
                        },
                      ];
                    }

                    await this.service.savePlayer(playerMention);
                    service.savePlayer(player).then((resSave) => {
                      if (resSave.status === 200) {
                        this.embed.setDescription(`Ты нанял вора.`);
                        this.send({
                          embeds: [setEmbedAuthor(this.embed, user)],
                        });
                      } else {
                        this.embed.setDescription(
                          `Не получилось нанять вора. Попробуй позже.`,
                        );
                        this.send({
                          embeds: [setEmbedAuthor(this.embed, user)],
                        });
                      }
                    });
                  } else {
                    this.embed.setDescription(`У твоего соседа нет пугала.`);
                    this.send({
                      embeds: [setEmbedAuthor(this.embed, user)],
                    });
                  }
                }
              });
            } else {
              this.embed.setDescription(`Это не твой сосед.`);
              this.send({
                embeds: [setEmbedAuthor(this.embed, user)],
              });
            }
          } else {
            if (player.config.stars.isThief) {
              this.embed.setDescription(`Сегодня ты уже нанимал вора!`);
            } else {
              this.embed.setDescription(
                `Тебе не хватает ${price - player.stars} ⭐!`,
              );
            }
            this.send({
              embeds: [setEmbedAuthor(this.embed, user)],
            });
          }
        } else {
          this.replyNoUser(user);
        }
      });
    });
  }
}
