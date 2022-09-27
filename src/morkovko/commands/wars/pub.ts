import Command from './../Command';
import { setEmbedAuthor, abbreviateNumber } from './../helpers';
import { AppService } from './../../../app.service';
import { heroesMap } from './../../../helpers/heroes';

export class PubCommand extends Command {
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
          if (player.progressBonus < 3) {
            this.embed.setDescription(`Ты еще не достиг 3 уровня прогресса!`);
          } else {
            this.embed.setDescription(`**Твои герои**`);
            const heroes = player.wars.heroes.map((m) => {
              m.hero = heroesMap[m.name]();
              m.hero.setLevel(m.level);
              return m;
            });
            for (const v of heroes) {
              const playerHero = v;
              const hero = v.hero;
              const info = `Опыт: **${abbreviateNumber(
                playerHero.exp,
              )}/${abbreviateNumber(hero.getNeedUpgradeExp(1))}** ⚪`;
              const upgradePrice = `Стоимость улучшения: **${abbreviateNumber(
                hero.getUpgradePrice(1),
              )}** 🥕`;
              const bonus = hero.bonus ? `${hero.getBonusDescription()}\n` : '';
              const stats = `Уровень ${abbreviateNumber(
                hero.level,
              )} | 💚 ${abbreviateNumber(
                hero.getHealth(),
              )} | 🔺 ${abbreviateNumber(hero.getAttack())}`;
              this.embed.addFields({
                name: `${playerHero.name}`,
                value: `${stats}\n${bonus}${info}\n${upgradePrice}`,
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
