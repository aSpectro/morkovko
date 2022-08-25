import Command from './Command';
import { setEmbedAuthor } from './helpers';
import { AppService } from './../../app.service';

export class TopCommand extends Command {
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
      service.checkUser(user.id).then((res) => {
        if (res.status === 200) {
          const player = res.player;

          service.getUsersTop().then(async (resTop) => {
            if (resTop.status === 200) {
              const userRate = resTop.data.findIndex(
                (f) => f.userId === player.userId,
              );
              this.embed.setDescription(
                `Твое место в рейтинге **${
                  userRate + 1
                }**! Размер морковки **${player.carrotSize.toLocaleString()}** см`,
              );

              const data = resTop.data.slice(0, 4);
              const reqs = [];

              for (let i = 0; i < data.length; i++) {
                const u = resTop.data[i];
                const req = await service.getUsername(u.userId);
                reqs.push(req);
              }
              Promise.all([...reqs]).then((resData) => {
                for (let i = 0; i < resData.length; i++) {
                  const field = {
                    nickname: resData[i].username,
                    size: resTop.data[i].carrotSize,
                  };
                  this.embed.addFields({
                    name: `${i + 1}. ${field.nickname}`,
                    value: `Размер морковки **${field.size.toLocaleString()}** см`,
                  });
                }
                this.send({
                  embeds: [setEmbedAuthor(this.embed, user)],
                });
              });
            } else {
              this.embed.setDescription(
                `Не получилось получить рейтинг. Попробуй позже.`,
              );
              this.send({
                embeds: [setEmbedAuthor(this.embed, user)],
              });
            }
          });
        } else {
          this.replyNoUser(user);
        }
      });
    });
  }
}
