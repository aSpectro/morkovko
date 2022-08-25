import Command from './Command';
import { AppService } from './../../app.service';

export class PingCommand extends Command {
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
      this.message.reply('pong!');
    });
  }
}
