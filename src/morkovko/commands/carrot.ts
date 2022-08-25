import Command from './Command';
import { AttachmentBuilder } from 'discord.js';
import { createCanvas, loadImage } from 'canvas';
import { setEmbedAuthor } from './helpers';
import { AppService } from './../../app.service';

export class CarrotCommand extends Command {
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
          const player = res.player;
          const canvas = createCanvas(256, 256);
          const ctx = canvas.getContext('2d');
          const carrot = await loadImage(player.carrotAvatar);
          ctx.drawImage(carrot, 0, 0, 256, 256);
          const attachment = new AttachmentBuilder(
            canvas.toBuffer('image/png'),
            {
              name: 'carrot.png',
            },
          );

          if (carrot) {
            this.embed.setDescription(
              `Размер морковки **${player.carrotSize.toLocaleString()}** см`,
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
