import Command from './Command';
import {
  setEmbedAuthor,
  getChance,
  randomIntFromInterval,
  abbreviateNumber,
} from './helpers';
import { AppService } from './../../app.service';
import { WarsService } from 'src/wars.service';

export class SellCommand extends Command {
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
          const grabChance = getChance();
          const grabPercent = player.slotsCount >= 50 ? 15 : 5;
          let grab = false;
          if (grabChance <= grabPercent) grab = true;
          if (!player.config?.fair?.isActive) grab = false;
          let count: any = this.getArgAll('кол-во');
          count = count === 'all' ? player.carrotCount : count;
          if (count && player.carrotCount >= count) {
            if (player.carrotCount === 1) grab = false;
            player.carrotCount -= count;
            const grabCount = grab ? Math.floor(count / 2) : count;
            player.points += grab
              ? (count - (grabCount === 0 ? 1 : grabCount)) * this.locale.getBonus(player.config?.fair?.isActive)
              : count * this.locale.getBonus(player.config?.fair?.isActive);

            const fundRes = await service.getActiveFund();
            if (fundRes.status === 200 && grab) {
              const fund = fundRes.fund;
              fund.fundSize += grabCount === 0 ? 1 : grabCount;
              await service.saveFund(fund);
            }

            service.savePlayer(player).then(async (resSave) => {
              if (resSave.status === 200) {
                if (grab) {
                  const neighbours = await this.service.getUserNeighbours(
                    user.id,
                  );
                  const neighbourNumber =
                    neighbours.data.length === 2
                      ? randomIntFromInterval(0, 1)
                      : 0;
                  if (
                    neighbours &&
                    neighbours.status === 200 &&
                    neighbours.data.length > 0
                  ) {
                    const neighbour = neighbours.data[neighbourNumber];
                    this.embed.setDescription(
                      `Во время продажи тебя увидел твой сосед - <@${
                        neighbour.userId
                      }> и сдал тебя налоговой, у тебя изъяли ${
                        grabCount === 0 ? 1 : abbreviateNumber(grabCount)
                      } ${this.locale.getCurrency()} в счет фонда борьбы с моррупцией. Ты смог продать ${abbreviateNumber(
                        count - grabCount,
                      )} ${this.locale.getCurrency()}. Теперь у тебя на счету ${abbreviateNumber(
                        player.points,
                      )}🔸`,
                    );
                  } else {
                    this.embed.setDescription(
                      `Во время продажи тебя кто-то увидел и позвонил в налоговую, у тебя изъяли ${
                        grabCount === 0 ? 1 : abbreviateNumber(grabCount)
                      } ${this.locale.getCurrency()} в счет фонда борьбы с моррупцией. Ты смог продать ${abbreviateNumber(
                        count - grabCount,
                      )} ${this.locale.getCurrency()}. Теперь у тебя на счету ${abbreviateNumber(
                        player.points,
                      )}🔸`,
                    );
                  }
                } else {
                  this.embed.setDescription(
                    `Ты продал ${abbreviateNumber(
                      count,
                    )} ${this.locale.getCurrency()}. Теперь у тебя на счету ${abbreviateNumber(
                      player.points,
                    )}🔸`,
                  );
                }
                this.send({
                  embeds: [setEmbedAuthor(this.embed, user)],
                });
              } else {
                this.embed.setDescription(
                  `Не получилось продать ${this.locale.getCurrency()}. Попробуй позже.`,
                );
                this.send({
                  embeds: [setEmbedAuthor(this.embed, user)],
                });
              }
            });
          } else {
            if (!count) {
              this.embed.setDescription(`Ты не указал кол-во ${this.locale.getCurrency()}!`);
            } else {
              this.embed.setDescription(
                `Тебе не хватает ${abbreviateNumber(
                  count - player.carrotCount,
                )}${this.locale.getCurrency()}!`,
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
