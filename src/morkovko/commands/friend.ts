import Command from './Command';
import { AttachmentBuilder } from 'discord.js';
import { createCanvas, loadImage } from 'canvas';
import { setEmbedAuthor, getRelLevelName } from './helpers';
import { AppService } from './../../app.service';

export class FriendCommand extends Command {
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
      service.checkUser(user.id).then((res) => {
        if (res.status === 200) {
          const player = res.player;
          if (userMention && userMention.id !== user.id) {
            service.checkUser(userMention.id).then(async (resMention) => {
              if (resMention.status === 200) {
                const playerMention = resMention.player;
                const canvas = createCanvas(256, 256);
                const ctx = canvas.getContext('2d');
                const carrot = await loadImage(playerMention.carrotAvatar);
                ctx.drawImage(carrot, 0, 0, 256, 256);
                const attachment = new AttachmentBuilder(
                  canvas.toBuffer('image/png'),
                  {
                    name: 'carrot.png',
                  },
                );

                if (carrot) {
                  let relations = '';
                  const friendRelations = player.relations
                    ? player.relations.find((f) => f.userId === userMention.id)
                    : false;

                  if (friendRelations) {
                    relations = `Ваши отношения ${
                      friendRelations.level
                    } очков - **${getRelLevelName(friendRelations.level)}**.`;
                  } else {
                    relations = 'Вы еще не знакомы с этим игроком.';
                  }

                  this.embed.setDescription(
                    `**${
                      userMention.username
                    }**\nРазмер морковки **${playerMention.carrotSize.toLocaleString()}** см.\n${relations}`,
                  );
                  this.send({
                    embeds: [setEmbedAuthor(this.embed, user)],
                    files: [attachment],
                  });
                }
              } else {
                this.embed.setDescription(
                  'Похоже, что он еще не открыл свою ферму!',
                );
                this.send({
                  embeds: [setEmbedAuthor(this.embed, user)],
                });
              }
            });
          } else {
            this.embed.setDescription('Ты не упомянул игрока!');
            this.send({
              embeds: [setEmbedAuthor(this.embed, user)],
            });
          }
        } else {
          this.replyNoUser(user);
        }
      });
    });
  }
}
