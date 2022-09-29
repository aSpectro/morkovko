import Command from './../Command';
import {
  getHeroByName,
  abbreviateNumber,
  normalizeHeroName,
} from './../helpers';
import { AppService } from './../../../app.service';
import { Currency, Actions, HeroType } from './../../../enums';
import { heroesMap, Hero } from './../../../helpers/heroes';
import { PlayerDTO } from '../../../dto/player.dto';
import { WarsService } from 'src/wars.service';

export class HeroCommand extends Command {
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
      const action = this.getArgByIndex(0);
      const heroName = this.getArgByIndex(1);
      const count = Math.abs(parseInt(this.getArgByIndex(2)));
      service.checkUser(user.id).then(async (res) => {
        if (res.status === 200) {
          const player = res.player as PlayerDTO;
          const checkHeroName = (heroName) => {
            const name = normalizeHeroName(heroName);
            if (!name) {
              this.addError('Ты не указал имя героя!');
              return false;
            } else if (name && !heroesMap[name]) {
              this.addError('Такого героя нет!');
              return false;
            }
            return true;
          };

          const isHasHero = checkHeroName(heroName);
          const isPlayerHasHero = player?.wars?.heroes?.find(
            (f) => f.name === normalizeHeroName(heroName),
          );

          const hero: Hero = getHeroByName(normalizeHeroName(heroName))();

          if (action === Actions.employ) {
            if (!isPlayerHasHero) {
              let currency: Currency = Currency.carrots;
              switch (hero.type) {
                case HeroType.normal: {
                  break;
                }
                case HeroType.elit: {
                  currency = Currency.stars;
                  break;
                }
                case HeroType.legendary: {
                  currency = Currency.donate;
                  break;
                }
              }

              if (currency !== Currency.donate) {
                const hasCurrency = this.checkUserHasCurrency(
                  hero.price,
                  currency,
                  player,
                );
                if (hasCurrency.isHas) {
                  const resBuy = await this.buyHero(player, hero, currency);
                  if (resBuy.status === 200) {
                    this.embed.setDescription(
                      `Ты нанял героя - ${normalizeHeroName(heroName)}`,
                    );
                  } else {
                    this.addError(
                      'Не получилось нанять героя, попробуй позже!',
                    );
                  }
                } else {
                  this.addError(hasCurrency.error as string);
                }
              } else {
                this.addError(
                  'Этого героя можно выбить только в золотой молитве!',
                );
              }
            } else {
              this.addError('У тебя уже есть этот герой!');
            }
          } else if (action === Actions.info && isHasHero) {
            if (isPlayerHasHero) {
              const playerHero: any = player.wars.heroes.find(
                (f) => f.name === hero.name,
              );
              hero.setLevel(playerHero.level);
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
              this.embed.setDescription(
                `**${hero.name}**\n${stats}\n${bonus}${info}\n${upgradePrice}`,
              );
            } else {
              this.addError('У тебя нет этого героя!');
            }
          } else if (action === Actions.upgrade && isHasHero) {
            if (isPlayerHasHero) {
              if (count) {
                const playerHero: any = player.wars.heroes.find(
                  (f) => f.name === hero.name,
                );
                hero.setLevel(playerHero.level);
                const expNeed = hero.getNeedUpgradeExp(count);
                const priceNeed = hero.getUpgradePrice(count);

                if (player.carrotCount >= priceNeed) {
                  if (playerHero.exp >= expNeed) {
                    const resUpgrade = await this.upgradeHero(
                      player,
                      hero,
                      count,
                    );
                    if (resUpgrade.status === 200) {
                      this.embed.setDescription(`Ты повысил уровень героя!`);
                    } else {
                      this.addError(
                        'Не получилось попысить уровень героя, попробуй позже!',
                      );
                    }
                  } else {
                    this.addError(
                      `У твоего героя недостаточно очков опыта! Нужно еще **${abbreviateNumber(
                        expNeed - playerHero.exp,
                      )}** ⚪`,
                    );
                  }
                } else {
                  this.addError(
                    `Тебе не хватает **${abbreviateNumber(
                      priceNeed - player.carrotCount,
                    )}** 🥕`,
                  );
                }
              } else {
                this.addError('Ты не указал кол-во уровней для повышения!');
              }
            } else {
              this.addError('У тебя нет этого героя!');
            }
          } else {
            this.addError(
              `Ты не указал действие: ${Actions.employ}|${Actions.info}|${Actions.upgrade}`,
            );
          }

          (await this.catchErrors()).send();
        } else {
          this.replyNoUser(user);
        }
      });
    });
  }
}
