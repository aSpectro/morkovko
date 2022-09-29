import Command from './../Command';
import { AppService } from './../../../app.service';
import { WarsService } from 'src/wars.service';

export class NCCommand extends Command {
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
      if (user.id === this.config.admin) {
        service.nullCarrots();
      }
    });
  }
}
