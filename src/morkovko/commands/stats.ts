import Command from './Command';
import { setEmbedAuthor } from './helpers';
import { AppService } from './../../app.service';

export class StatsCommand extends Command {
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
      service.checkUser(user.id).then(async (res) => {
        if (res.status === 200) {
          const statsRes = await this.service.getStats();
          if (statsRes && statsRes.status === 200) {
            const commandsCount = `Команд вызвано: ${statsRes.stats.commandsCount.toLocaleString()}\n`;
            const playersCount = `Всего игроков: ${statsRes.stats.playersCount.toLocaleString()}\n`;
            const allCarrotsCount = `Морковок в игре: ${statsRes.stats.allCarrotsCount.toLocaleString()}\n`;
            this.embed.setDescription(
              `${playersCount + allCarrotsCount + commandsCount}`,
            );
            this.send({ embeds: [setEmbedAuthor(this.embed, user)] });
          }
        } else {
          this.replyNoUser(user);
        }
      });
    });
  }
}
