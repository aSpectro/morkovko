import Command from './Command';
import { setEmbedAuthor, getChance } from './helpers';
import { AppService } from './../../app.service';

export class SellCommand extends Command {
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
          const grabChance = getChance();
          const grabPercent = player.slotsCount >= 50 ? 15 : 5;
          let grab = false;
          if (grabChance <= grabPercent) grab = true;
          const count = this.getArgString('кол-во');
          if (count && player.carrotCount >= count) {
            if (player.carrotCount === 1) grab = false;
            player.carrotCount -= count;
            const grabCount = grab ? Math.floor(count / 2) : count;
            player.points += grab
              ? count - (grabCount === 0 ? 1 : grabCount)
              : count;

            const fundRes = await service.getActiveFund();
            if (fundRes.status === 200) {
              const fund = fundRes.fund;
              fund.fundSize += grabCount === 0 ? 1 : grabCount;
              await service.saveFund(fund);
            }

            service.savePlayer(player).then((resSave) => {
              if (resSave.status === 200) {
                if (grab) {
                  this.embed.setDescription(
                    `Во время продажи тебя кто-то увидел и позвонил в налоговую, у тебя изъяли ${
                      grabCount === 0 ? 1 : grabCount
                    }🥕 в счет фонда борьбы с моррупцией. Ты смог продать ${
                      count - grabCount
                    }🥕. Теперь у тебя на счету ${player.points}🔸`,
                  );
                } else {
                  this.embed.setDescription(
                    `Ты продал ${count}🥕. Теперь у тебя на счету ${player.points}🔸`,
                  );
                }
                this.send({
                  embeds: [setEmbedAuthor(this.embed, user)],
                });
              } else {
                this.embed.setDescription(
                  `Не получилось продать 🥕. Попробуй позже.`,
                );
                this.send({
                  embeds: [setEmbedAuthor(this.embed, user)],
                });
              }
            });
          } else {
            if (!count) {
              this.embed.setDescription(`Ты не указал кол-во 🥕!`);
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
