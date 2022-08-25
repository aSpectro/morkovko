import Command from './../Command';
import { AppService } from './../../../app.service';

export class NPCommand extends Command {
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
      if (user.id === this.config.admin) {
        service.nullPoints();
      }
    });
  }
}
