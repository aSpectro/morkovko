import { configService } from './../config/config.service';

export default {
  admin: configService.getAdminId(),
  bot: {
    token: configService.getToken(),
    prefix: configService.isProduction() ? '!' : '.', // префикс бота prod/dev
    rpc: '/ᐠ｡ꞈ｡ᐟ\\', // дефолтное значение RPC
    botId: configService.getClientId(),
    hourProgress: 100 / 24, // deprecated
    carrotsLimit: configService.getCarrotsLimit(),
    clientId: configService.getClientId(),
    guildId: configService.geGuildId(),
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
        dung: 20,
        fine: 30,
      },
      maxDonate: 100000, // максимальное кол-во пожертвования
      policeFine: 10000, // штраф молиции
      adateFail: 1000, // кол-во при неудачном свидании
      maxGiftCount: 10, // максимальное кол-во подарка
      pugalo: 1000, // цена пугала
      upgrade: 2500, // цена увеличения морковки
      slot: 100, // цена горшка
      autoBuyPugalo: 100000, // цена бонуса автопокупки пугала
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
