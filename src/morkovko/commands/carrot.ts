import Command from './Command';
import { AttachmentBuilder } from 'discord.js';
import { createCanvas, loadImage } from 'canvas';
import { setEmbedAuthor, abbreviateNumber } from './helpers';
import { AppService } from './../../app.service';
import { WarsService } from 'src/wars.service';

export class CarrotCommand extends Command {
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
          const player = res.player;
          const canvas = createCanvas(256, 256);
          const ctx = canvas.getContext('2d');
          let mutation = player.carrotAvatar;
          if (this.locale.name === 'halloween') {
            mutation = player.pumpkinAvatar;
          }
          const carrot = await loadImage(mutation);
          ctx.drawImage(carrot, 0, 0, 256, 256);
          const attachment = new AttachmentBuilder(
            canvas.toBuffer('image/png'),
            {
              name: 'carrot.png',
            },
          );

          if (carrot) {
            this.embed.setDescription(
              `Размер ${this.locale.getEnum('морковки')} **${abbreviateNumber(player.carrotSize)}** см`,
            );
            this.send({
              embeds: [setEmbedAuthor(this.embed, user)],
              files: [attachment],
            });
          }
        } else {
          this.replyNoUser(user);
        }
      });
    });
  }
}
