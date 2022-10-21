import { configService } from './../config/config.service';
import { BonusType } from 'src/enums';

export default {
  admin: configService.getAdminId(),
  isMutatorMode: process.env.MUTATOR ? process.env.MUTATOR : false,
  bot: {
    token: configService.getToken(),
    prefix: configService.isProduction() ? '!' : '.', // префикс бота prod/dev
    rpc: '/ᐠ｡ꞈ｡ᐟ\\', // дефолтное значение RPC
    botId: configService.getClientId(),
    hourProgress: 100 / 24, // deprecated
    clientId: configService.getClientId(),
    guildId: configService.geGuildId(),
    wars: {
      bonuses: [
        [BonusType.debuf, 10],
        [BonusType.health, 10],
        [BonusType.fury, 15],
        [BonusType.dawn, 5],
      ],
      k: 1.2,
      expLevel: 5000,
      expBattle: 100,
      boss: {
        attackCount: 150,
        healthCount: 1500,
        level: 5,
      },
      heroes: {
        jake: 150,
        bob: 250000,
        ded: 200,
        rebot: 120,
        viktor: 235000,
        john: 190000,
        salieri: 275000,
        antonio: 300000,
        don: 150000,
        freddy: 220000,
      },
    },
    economy: {
      pray: [5000, 10000, 15000, 20000], // возможные значения за молитву
      exitStars: 100, // кол-во звезд за прогресс
      shopRules: {
        // необходимые размеры морковок для бонусов
        autoBuyPugalo: 200,
        slotSpeedUpdate: 100,
        cooldowns: 150,
      },
      stars: {
        // цены в магазине звезд
        debuff: 25,
        thief: 10,
        dung: 35,
        fine: 30,
      },
      maxDonate: 100000, // максимальное кол-во пожертвования
      policeFine: 10000, // штраф молиции
      adateFail: 1000, // кол-во при неудачном свидании
      maxGiftCount: 10, // максимальное кол-во подарка
      pugalo: 1000, // цена пугала
      upgrade: 2500, // цена увеличения морковки
      slot: 100, // цена горшка
      autoBuyPugalo: 75000, // цена бонуса автопокупки пугала
      slotSpeedUpdate: 1000, // цена бонуса скорости роста
      cooldowns: {
        // цены бонусов кулдаунов
        adate: 1500,
        watering: 1000,
        pray: 2000,
      },
    },
    badgeColor: '#f97a50',
    dslink: `https://discord.com/oauth2/authorize?client_id=${configService.getClientId()}&scope=bot&permissions=17179878400`,
  },
};
