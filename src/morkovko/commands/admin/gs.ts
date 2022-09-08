import Command from './../Command';
import { AppService } from './../../../app.service';

export class GSCommand extends Command {
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
      const userMention = this.getArgUser('игрок');
      const count = this.getArgString('кол-во');
      if (user.id === this.config.admin) {
        service.giveSlots(userMention.id, count);
      }
    });
  }
}
