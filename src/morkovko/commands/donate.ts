import Command from './Command';
import { setEmbedAuthor } from './helpers';
import { AppService } from './../../app.service';

export class DonateCommand extends Command {
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
      const { maxDonate } = this.config.bot.economy;
      service.checkUser(user.id).then(async (res) => {
        if (res.status === 200) {
          const player = res.player;
          const count = this.getArgString('кол-во');
          if (
            count &&
            player.carrotCount >= count &&
            count <= maxDonate &&
            !player.config.isDonateToday
          ) {
            player.carrotCount -= count;
            player.config.isDonateToday = true;

            const fundRes = await this.service.getActiveFund();
            if (fundRes.status === 200) {
              const fund = fundRes.fund;
              fund.fundSize += count;
              await this.service.saveFund(fund);
            }

            service.savePlayer(player).then((resSave) => {
              if (resSave.status === 200) {
                this.embed.setDescription(`Ты пожертвовал **${count}** 🥕.`);
                this.send({
                  embeds: [setEmbedAuthor(this.embed, user)],
                });
              }
            });
          } else {
            if (!count) {
              this.embed.setDescription(`Ты не указал кол-во 🥕!`);
            } else if (count > maxDonate) {
              this.embed.setDescription(
                `В день можно пожертвовать максимум **100 000**🥕 и только один раз!`,
              );
            } else if (player.config.isDonateToday) {
              this.embed.setDescription(`Сегодня ты уже пожертвовал 🥕!`);
            } else {
              this.embed.setDescription(
                `Тебе не хватает ${count - player.carrotCount}🥕!`,
              );
            }
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
