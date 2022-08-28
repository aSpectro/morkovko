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
      pugalo: 1,
      upgrade: 5,
      slot: 3,
      autoBuyPugalo: 300,
      slotSpeedUpdate: 100,
      cooldowns: {
        adate: 50,
        watering: 70,
        pray: 100,
      },
    },
    badgeColor: '#f97a50',
    dslink: `https://discord.com/oauth2/authorize?client_id=${configService.getClientId()}&scope=bot&permissions=17179878400`,
  },
};
