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
          if (userFriends && userFriends.length > 0) {
            const mentions = userFriends.map((m) => `<@${m.userId}>`).join(' ');
            this.send(
              `${mentions} Ваш друг хочет выкти, подарите ему морковок!`,
            );
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
