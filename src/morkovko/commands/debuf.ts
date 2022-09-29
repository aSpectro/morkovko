import Command from './Command';
import { setEmbedAuthor } from './helpers';
import { AppService } from './../../app.service';
import { WarsService } from 'src/wars.service';

export class DebufCommand extends Command {
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
      const { debuff, fine } = this.config.bot.economy.stars;
      service.checkUser(user.id).then(async (res) => {
        if (res.status === 200 && res.player) {
          const player = res.player;
          const price = debuff;
          if (
            userMention &&
            player.stars >= price &&
            !player.config.stars.isDebuff &&
            userMention.id !== user.id
          ) {
            const neighbours = await this.service.getUserNeighbours(user.id);
            const neighbour = neighbours.data.find(
              (f) => f.userId === userMention.id,
            );
            if (neighbour) {
              player.config.stars.isDebuff = true;
              player.stars -= price;
              service.checkUser(userMention.id).then(async (resMention) => {
                if (resMention.status === 200) {
                  const playerMention = resMention.player;
                  playerMention.config.debuffs += 1;

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
                      this.embed.setDescription(`Ты купил дебаф.`);
                      this.send({
                        embeds: [setEmbedAuthor(this.embed, user)],
                      });
                    } else {
                      this.embed.setDescription(
                        `Не получилось купить дебаф. Попробуй позже.`,
                      );
                      this.send({
                        embeds: [setEmbedAuthor(this.embed, user)],
                      });
                    }
                  });
                }
              });
            } else {
              this.embed.setDescription(`Это не твой сосед.`);
              this.send({
                embeds: [setEmbedAuthor(this.embed, user)],
              });
            }
          } else {
            if (player.config.stars.isDebuff) {
              this.embed.setDescription(`Сегодня ты уже покупал дебаф!`);
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
