import Command from './Command';
import { setEmbedAuthor } from './helpers';
import { AppService } from './../../app.service';
import { WarsService } from 'src/wars.service';

export class ExitCommand extends Command {
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
      service.checkUser(user.id).then(async (res) => {
        if (res.status === 200) {
          const player = res.player;
          const userFriends = player.relations;
          const exitPing = () => {
            const mentions = userFriends.map((m) => `<@${m.userId}>`).join(' ');
            this.send(
              `${mentions} Ваш друг хочет выкти, подарите ему ${this.locale.getEnum('морковок')}!`,
            );
          };

          const exitResult = async () => {
            this.resetPlayer(player);
            player.progressBonus += 1;
            const resSave = await this.service.savePlayer(player);
            if (resSave.status === 200) {
              this.embed.setDescription(
                `Твоя ${this.locale.getEnum('морковка')} достаточно большая, ты успешно вышел из игры, твой прогресс был сброшен! Поздравляю 💚!\n
                Теперь у тебя постоянный бонус ${player.progressBonus}% к скорости роста ${this.locale.getEnum('морковки')} и x${player.progressBonus} кол-ву выращенной ${this.locale.getEnum('морковки')} и за молитву.\n`,
              );
              this.send({
                embeds: [setEmbedAuthor(this.embed, user)],
              });
            } else {
              exitPing();
            }
          };

          if (userFriends && userFriends.length > 0) {
            if (
              player.carrotSize >= this.getExitCarrotSize(player.progressBonus)
            ) {
              exitResult();
            } else {
              exitPing();
            }
          } else {
            this.embed.setDescription(`У тебя нет друзей, чтобы выкти.`);
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
