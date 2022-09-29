import config from '../morkovko/config';
import { BonusType } from './../enums';
import random from 'src/helpers/random';

export interface Bonus {
  type: BonusType;
  size?: number;
}

export function mapBonusDescription(bonusName, bonusSize): string {
  const mapper = {
    [BonusType.debuf]: (bonusSize) =>
      `Бонус: ослабляет силу аттаки героев игрока на **${bonusSize}%** с шансом 50%`,
    [BonusType.health]: (bonusSize) =>
      `Бонус: регенерирует здоровье на **${bonusSize}%** после каждой атаки`,
    [BonusType.fury]: (bonusSize) =>
      `Бонус: получает **${bonusSize}%** к урону с шансом 50%;`,
    [BonusType.dawn]: (bonusSize) =>
      `Бонус: с шансом ${bonusSize}% наносит критический урон равный **100%** здоровья рандомного героя игрока.`,
  };

  return mapper[bonusName](bonusSize);
}

export class Boss {
  public level: number;
  public healthCount: number;
  public attackCount: number;
  public bonus?: Bonus;
  constructor(progressLevel: number, bonus: Bonus) {
    const { level, healthCount, attackCount } = config.bot.wars.boss;
    const k = config.bot.wars.k;
    this.level = Math.round(progressLevel * level * k);
    this.healthCount = Math.round(healthCount * progressLevel * k);
    this.attackCount = Math.round(attackCount * progressLevel * k);
    this.bonus = bonus;
  }

  public getAttack(): number {
    let result = this.attackCount;
    if (this.bonus.type === BonusType.fury) {
      const chance = random.float() * 100;
      if (chance <= 50) {
        result -= (result / 100) * this.bonus.size;
      }
    }
    return Math.round(result);
  }

  public getHealth(): number {
    return Math.round(this.healthCount);
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
}
