import Command from './Command';
import { setEmbedAuthor } from './helpers';
import { AppService } from './../../app.service';

export class StartCommand extends Command {
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
      const player = {
        userId: user.id,
        carrotAvatar: this.getRandomAvatar(),
      };
      service.createPlayer(player).then((res) => {
        if (res.status === 200) {
          this.embed
            .setDescription(
              `Поздравляю, ты открыл свою ферму морковок, сейчас у тебя один горшок, поливай его, чтобы скорее вырастить свою первую морковку!`,
            )
            .addFields({
              name: '!помощь',
              value: 'Список команд',
              inline: true,
            });
          this.send({ embeds: [setEmbedAuthor(this.embed, user)] });
        } else {
          this.embed
            .setDescription(`Ты уже в игре, чтобы начать заного надо выкти!`)
            .addFields({
              name: '!выкти',
              value: 'Выкти из игры',
              inline: true,
            });
          this.send({ embeds: [setEmbedAuthor(this.embed, user)] });
        }
      });
    });
  }
}
