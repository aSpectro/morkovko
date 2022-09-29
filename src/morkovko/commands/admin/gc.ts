import Command from './../Command';
import { AppService } from './../../../app.service';
import { WarsService } from 'src/wars.service';

export class GCCommand extends Command {
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
      const userMention = this.getArgUser('игрок');
      const count = this.getArgString('кол-во');
      if (user.id === this.config.admin) {
        service.giveCarrots(userMention.id, count);
      }
    });
  }
}
