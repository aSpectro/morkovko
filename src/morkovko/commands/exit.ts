import Command from './Command';
import { setEmbedAuthor } from './helpers';
import { AppService } from './../../app.service';

export class ExitCommand extends Command {
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
          const exitPing = () => {
            const mentions = userFriends.map((m) => `<@${m.userId}>`).join(' ');
            this.send(
              `${mentions} Ваш друг хочет выкти, подарите ему морковок!`,
            );
          };
          if (userFriends && userFriends.length > 0) {
            if (player.carrotSize >= 100) {
              this.resetPlayer(player);
              player.progressBonus += 1;
              this.service.savePlayer(player).then((resSave) => {
                if (resSave.status === 200) {
                  this.embed.setDescription(
                    `Твоя морковка достаточно большая, ты успешно вышел из игры, твой прогресс был сброшен! Поздравляю 💚!\n
                    Теперь у тебя постоянный бонус ${player.progressBonus}% к скорости роста морковки и x${player.progressBonus} кол-ву выращенной морковки и за молитву.`,
                  );
                  this.send({
                    embeds: [setEmbedAuthor(this.embed, user)],
                  });
                } else {
                  exitPing();
                }
              });
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
