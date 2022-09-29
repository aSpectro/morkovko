import config from 'src/morkovko/config';
import { HeroType, BonusType } from './../enums';
import random from 'src/helpers/random';

export interface Bonus {
  name: string;
  type: BonusType;
  size?: number;
}

export function mapBonusDescription(bonusName, bonusSize): string {
  const mapper = {
    [BonusType.debuf]: (bonusSize) =>
      `Бонус: ослабляет силу аттаки противника на **${bonusSize}%** с шансом 50%`,
    [BonusType.health]: (bonusSize) =>
      `Бонус: дает отхил здоровья **${bonusSize}%** всем героям после каждой атаки`,
    [BonusType.fury]: (bonusSize) =>
      `Бонус: дает бонус **${bonusSize}%** к урону с шансом 50%;`,
  };

  return mapper[bonusName](bonusSize);
}

export class Hero {
  public price: number;
  public type: HeroType;
  public level: number;
  public bonus?: Bonus;
  public healthCount: number;
  public attackCount: number;
  public name: string;
  constructor(
    heroName: string,
    healthCount: number,
    attackCount: number,
    price: number,
    type: HeroType,
    bonus?: Bonus,
  ) {
    this.name = heroName;
    this.price = price;
    this.type = type;
    this.bonus = bonus;
    this.healthCount = healthCount;
    this.attackCount = attackCount;
  }

  public setLevel(level: number) {
    this.level = level;
  }

  public getAttack(): number {
    let result = this.attackCount;
    if (
      this.type === HeroType.elit &&
      this.bonus &&
      this.bonus.type === BonusType.fury
    ) {
      const chance = random.float() * 100;
      if (chance <= 50) {
        result -= (result / 100) * this.bonus.size;
      }
    }
    return Math.round(result * this.level);
  }

  public getHealth(): number {
    return Math.round(this.healthCount * this.level);
  }

  public addHealth(count: number) {
    this.healthCount += count;
  }

  public decHealth(count: number) {
    if (this.healthCount - count < 0) {
      this.healthCount = 0;
    } else {
      this.healthCount -= count;
    }
  }

  public kill() {
    this.healthCount = 0;
  }

  public getBonusDescription(): string {
    if (!this.bonus) return '';
    return mapBonusDescription(this.bonus.type, this.bonus.size);
  }

  public getUpgradePrice(count: number): number {
    let res = 0;
    let level = this.level;
    let defPrice = 0;
    const price =
      this.type === HeroType.normal ? this.price : this.price * 3000;

    for (let i = 0; i < count; i++) {
      if (this.type === HeroType.normal) {
        defPrice = price * 0.5 * 1.05 * (level * 0.5);
      } else if (this.type === HeroType.elit) {
        defPrice = price * 0.5 * 1.55 * (level * 0.5);
      } else {
        defPrice = price * 0.5 * 2 * (level * 0.5);
      }

      res += defPrice;
      level += 1;
    }

    return Math.round(res);
  }

  public getNeedUpgradeExp(count: number) {
    const { expLevel } = config.bot.wars;
    let res = 0;
    let level = this.level;
    let defExp = 0;

    for (let i = 0; i < count; i++) {
      if (this.type === HeroType.normal) {
        defExp = expLevel * 0.5 * 1.05 * (level * 0.5);
      } else if (this.type === HeroType.elit) {
        defExp = expLevel * 0.5 * 1.55 * (level * 0.5);
      } else {
        defExp = expLevel * 0.5 * 2 * (level * 0.5);
      }

      res += defExp;
      level += 1;
    }

    return Math.round(res);
  }
}

const { jake, bob, rebot, ded, viktor, john, salieri, antonio, don, freddy } =
  config.bot.wars.heroes;
const hero1bonus = { name: 'Дебаф', type: BonusType.debuf, size: 15 };
const hero2bonus = { name: 'Отхил', type: BonusType.health, size: 5 };
const hero3bonus = { name: 'Ярость', type: BonusType.fury, size: 10 };

// Heroes list
export const heroesMap = {
  Джейк: () => new Hero('Джейк', 500, 340, jake, HeroType.elit, hero1bonus),
  Rebot: () => new Hero('Rebot', 300, 210, rebot, HeroType.elit, hero2bonus),
  Дед: () => new Hero('Дед', 430, 290, ded, HeroType.elit, hero3bonus),
  Боб: () => new Hero('Боб', 140, 60, bob, HeroType.normal),
  Виктор: () => new Hero('Виктор', 120, 75, viktor, HeroType.normal),
  Джон: () => new Hero('Джон', 110, 50, john, HeroType.normal),
  Сальери: () => new Hero('Сальери', 170, 60, salieri, HeroType.normal),
  Антонио: () => new Hero('Антонио', 150, 95, antonio, HeroType.normal),
  Дон: () => new Hero('Дон', 90, 85, don, HeroType.normal),
  Фредди: () => new Hero('Фредди', 165, 55, freddy, HeroType.normal),
};
