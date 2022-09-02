import { configService } from './../config/config.service';

export default {
  admin: configService.getAdminId(),
  bot: {
    token: configService.getToken(),
    prefix: configService.isProduction() ? '!' : '.',
    rpc: '/ᐠ｡ꞈ｡ᐟ\\',
    botId: configService.getClientId(),
    hourProgress: 100 / 24,
    carrotsLimit: configService.getCarrotsLimit(),
    clientId: configService.getClientId(),
    guildId: configService.geGuildId(),
    economy: {
      exitStars: 100,
      shopRules: {
        autoBuyPugalo: 200,
        slotSpeedUpdate: 100,
        cooldowns: 150,
      },
      maxGiftCount: 10,
      pugalo: 300,
      upgrade: 2500,
      slot: 100,
      autoBuyPugalo: 30000,
      slotSpeedUpdate: 1000,
      cooldowns: {
        adate: 1500,
        watering: 1000,
        pray: 2000,
      },
    },
    badgeColor: '#f97a50',
    dslink: `https://discord.com/oauth2/authorize?client_id=${configService.getClientId()}&scope=bot&permissions=17179878400`,
  },
};
