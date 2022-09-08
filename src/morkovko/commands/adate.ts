import Command from './Command';
import * as moment from 'moment';
import {
  setEmbedAuthor,
  getTimeFromMins,
  calcNumberWithPercentBoost,
} from './helpers';
import { AppService } from './../../app.service';

export class AdateCommand extends Command {
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
      service.checkUser(user.id).then((res) => {
        if (res.status === 200) {
          const player = res.player;
          const userFriends = player.relations;
          const d1 = moment(player.lastADate);
          const d2 = moment(new Date());
          const diff = d2.diff(d1, 'minutes');
          const needDiff = calcNumberWithPercentBoost(
            1440,
            player.config.cooldowns.adate,
          );
          if (userFriends && userFriends.length > 0) {
            if (diff >= needDiff) {
              const successChance = Math.random() * 100;
              let isSuccess = false;
              if (successChance >= 10) isSuccess = true;
              const friend =
                userFriends[Math.floor(Math.random() * userFriends.length)];
              if (!isSuccess) player.carrotCount -= this.config.economy.adateFail;

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
                    if (!isSuccess) friendModel.carrotCount -= this.config.economy.adateFail;
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

                          this.embed.setDescription(
                            `Ты сходил на свидание с <@${
                              friendModel.userId
                            }>, ${
                              !isSuccess
                                ? `вы потеряли по ${this.config.economy.adateFail} 🥕,`
                                : ''
                            }${!isSuccess ? noCarrot : ''} ${result} ${
                              !isSuccess ? friendNoCarrot : ''
                            }`,
                          );
                          this.send({
                            embeds: [setEmbedAuthor(this.embed, user)],
                          });
                        } else {
                          this.embed.setDescription(
                            `Не получилось сходить на свидание. Попробуй позже.`,
                          );
                          this.send({
                            embeds: [setEmbedAuthor(this.embed, user)],
                          });
                        }
                      });
                    } else {
                      this.embed.setDescription(
                        `Не получилось сходить на свидание. Попробуй позже.`,
                      );
                      this.send({
                        embeds: [setEmbedAuthor(this.embed, user)],
                      });
                    }
                  });
                } else {
                  this.embed.setDescription(
                    `Не получилось сходить на свидание. Попробуй позже.`,
                  );
                  this.send({
                    embeds: [setEmbedAuthor(this.embed, user)],
                  });
                }
              });
            } else {
              this.embed.setDescription(
                `Ты сможешь сходить на свидание не раньше чем через ${getTimeFromMins(
                  needDiff - diff,
                )}!`,
              );
              this.send({
                embeds: [setEmbedAuthor(this.embed, user)],
              });
            }
          } else {
            this.embed.setDescription(
              `У тебя нет друзей, чтобы сходить на свидание.`,
            );
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
