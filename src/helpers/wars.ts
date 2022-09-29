import { PlayerDTO } from '../dto/player.dto';
import { BonusType } from './../enums';
import { Hero } from './heroes';
import { Boss, Bonus } from './boss';
import config from '../morkovko/config';
import { getHeroByName } from './../morkovko/commands/helpers';
import random from 'src/helpers/random';

export interface Result {
  player: {
    exp: number;
  };
  boss?: {
    level: number;
    healthCount: number;
    attackCount: number;
  };
}

export function calcBattleResult(
  player: PlayerDTO,
  enemy?: PlayerDTO,
): Promise<{
  status: number;
  result: Result;
}> {
  return new Promise((resolve) => {
    let enemies: (Boss | Hero)[] = [];

    if (!enemy) {
      const bossBonus: Bonus = {
        type: player.wars.bossBonus.type,
        size: player.wars.bossBonus.size,
      };
      const boss = new Boss(player.progressBonus, bossBonus);
      enemies.push(boss);
    } else {
      enemies = enemy.wars.heroes.map((m) => {
        const level = m.level;
        const hero = getHeroByName(m.name)();
        hero.setLevel(level);
        return hero;
      });
    }

    const heroes: Hero[] = player.wars.heroes.map((m) => {
      const level = m.level;
      const hero = getHeroByName(m.name)();
      hero.setLevel(level);
      return hero;
    });

    const result: { status: number; result: Result } = {
      status: 300,
      result: {
        player: {
          exp: 0,
        },
      },
    };

    const battleTick = (heroes, enemies) => {
      const debufHeroes = heroes.filter(
        (f) => f.bonus && f.bonus.type === BonusType.debuf,
      );
      const healthHeroes = heroes.filter(
        (f) => f.bonus && f.bonus.type === BonusType.health,
      );
      const debufEnemies = enemies.filter(
        (f) => f.bonus && f.bonus.type === BonusType.debuf,
      );
      const healthEnemies = enemies.filter(
        (f) => f.bonus && f.bonus.type === BonusType.health,
      );
      const dawnEnemies = enemies.filter(
        (f) => f.bonus && f.bonus.type === BonusType.dawn,
      );

      const heroesAttackSumm = heroes
        .filter((f) => f.getHealth() > 0)
        .reduce((t, hero) => hero.getAttack() + t, 0);
      let avgAttack = Math.round(heroesAttackSumm / enemies.length);

      debufEnemies.forEach((hero) => {
        const size = hero.bonus.size;
        const chance = random.float() * 100;
        if (chance <= 50) {
          avgAttack -= (avgAttack / 100) * size;
        }
      });

      enemies
        .filter((f) => f.getHealth() > 0)
        .forEach((enemy) => {
          enemy.decHealth(avgAttack);
        });

      healthEnemies.forEach((hero) => {
        const size = hero.bonus.size;
        enemies
          .filter((f) => f.getHealth() > 0)
          .forEach((h) => {
            const health = (h.getHealth() / 100) * size;
            h.addHealth(health);
          });
      });

      const enemiesAttackSumm = heroes
        .filter((f) => f.getHealth() > 0)
        .reduce((t, enemy) => enemy.getAttack() + t, 0);
      let avgAttackEnemies = Math.round(enemiesAttackSumm / heroes.length);

      debufHeroes.forEach((hero) => {
        const size = hero.bonus.size;
        const chance = random.float() * 100;
        if (chance <= 50) {
          avgAttackEnemies -= (avgAttackEnemies / 100) * size;
        }
      });

      heroes
        .filter((f) => f.getHealth() > 0)
        .forEach((hero) => {
          hero.decHealth(avgAttackEnemies);
        });

      healthHeroes.forEach((hero) => {
        const size = hero.bonus.size;
        heroes
          .filter((f) => f.getHealth() > 0)
          .forEach((h) => {
            const health = (h.getHealth() / 100) * size;
            h.addHealth(health);
          });
      });

      dawnEnemies.forEach((hero) => {
        const size = hero.bonus.size;
        const chance = random.float() * 100;
        if (chance <= size) {
          const filteredHeroes = heroes.filter((f) => f.getHealth() > 0);
          const hero =
            filteredHeroes[
              Math.floor(random.float() * filteredHeroes.length)
            ];
          hero.kill();
        }
      });

      const heroesAliveCount = heroes.filter((f) => f.getHealth() > 0).length;
      const enemiesAliveCount = enemies.filter((f) => f.getHealth() > 0).length;

      if (heroesAliveCount > 0 && enemiesAliveCount > 0) {
        result.result.player.exp += config.bot.wars.expBattle * enemies.length;
        battleTick(heroes, enemies);
      } else if (enemiesAliveCount === 0) {
        result.result.player.exp += config.bot.wars.expBattle * enemies.length;
        result.status = 200;
        result.result.player.exp *= player.progressBonus;
        if (!enemy) {
          const boss = enemies[0];
          result.result.boss = {
            level: boss.level,
            healthCount: boss.getHealth(),
            attackCount: boss.getAttack(),
          };
        }
        resolve(result);
      } else if (heroesAliveCount === 0) {
        result.result.player.exp += config.bot.wars.expBattle * enemies.length;
        result.status = 400;
        result.result.player.exp *= player.progressBonus;
        if (!enemy) {
          const boss = enemies[0];
          result.result.boss = {
            level: boss.level,
            healthCount: boss.getHealth(),
            attackCount: boss.getAttack(),
          };
        }
        resolve(result);
      }
    };

    battleTick(heroes, enemies);
  });
}
