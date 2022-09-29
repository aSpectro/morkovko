import Command from './Command';
import { setEmbedAuthor, abbreviateNumber } from './helpers';
import { AppService } from './../../app.service';
import { WarsService } from 'src/wars.service';

export class StatsCommand extends Command {
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
          const statsRes = await this.service.getStats();
          if (statsRes && statsRes.status === 200) {
            const commandsCount = `Команд вызвано: ${abbreviateNumber(
              statsRes.stats.commandsCount,
            )}\n`;
            const playersCount = `Всего игроков: ${abbreviateNumber(
              statsRes.stats.playersCount,
            )}\n`;
            const allCarrotsCount = `Морковок в игре: ${abbreviateNumber(
              statsRes.stats.allCarrotsCount,
            )}\n`;
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
