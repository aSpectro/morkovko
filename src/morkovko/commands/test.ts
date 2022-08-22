import Command from './Command';
import { Message, ChatInputCommandInteraction } from 'discord.js';
import { AppService } from './../../app.service';

export class StartCommand extends Command {
  constructor(commandName: string) {
    super(commandName);
  }

  run(
    message: Message | ChatInputCommandInteraction,
    args: string[],
    service: AppService,
    isSlash: boolean | undefined,
  ) {
    this.initCommand(message, args, service, isSlash, () => {
      this.name;
    });
  }
}
