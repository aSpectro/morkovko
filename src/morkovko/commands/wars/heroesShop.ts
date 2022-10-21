import Command from './../Command';
import { setEmbedAuthor, abbreviateNumber } from './../helpers';
import { AppService } from './../../../app.service';
import { HeroType } from './../../../enums';
import { heroesMap } from './../../../helpers/heroes';
import { WarsService } from 'src/wars.service';


export class HeroesShopCommand extends Command {
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
      service.checkUser(user.id).then((res) => {
        if (res.status === 200) {
          const player = res.player;
          if (player.progressBonus < 3) {
            this.embed.setDescription(`Ты еще не достиг 3 уровня прогресса!`);
          } else {
            this.embed.setDescription(`**Таверна героев**`);
            for (const hero of Object.entries(heroesMap)) {
              const price =
                hero[1]().type === HeroType.normal
                  ? `${abbreviateNumber(hero[1]().price)} ${this.locale.getCurrency()}`
                  : `${abbreviateNumber(hero[1]().price)} ⭐`;
              const bonus = hero[1]().bonus
                ? `${hero[1]().getBonusDescription()}`
                : '';

              const stats = `💚 ${hero[1]().healthCount.toLocaleString()} | 🔺 ${hero[1]().attackCount.toLocaleString()}`;

              this.embed.addFields({
                name: `${hero[0]}`,
                value: `${price}\n${hero[1]().type}\n${stats}\n${bonus}`,
                inline: false,
              });
            }
          }

          this.send({ embeds: [setEmbedAuthor(this.embed, user)] });
        } else {
          this.replyNoUser(user);
        }
      });
    });
  }
}
