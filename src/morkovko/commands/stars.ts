import Command from './Command';
import { setEmbedAuthor } from './helpers';
import { AppService } from './../../app.service';
import { WarsService } from 'src/wars.service';

export class StarsCommand extends Command {
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
      const { debuff, thief, dung } = this.config.bot.economy.stars;
      service.checkUser(user.id).then((res) => {
        if (res.status === 200) {
          const player = res.player;
          this.embed.setDescription(
            `Звезд: **⭐ ${player.stars.toLocaleString()}**\n
            **Важно:** вы можете купить **не больше одного** каждого из товаров в магазине звезд в сутки, сброс происходит в **01:00 МСК**. Негативные товары, а именно дебаф и найм вора так же существенно влияют на ваши отношения с соседом.`,
          );

          this.embed.addFields(
            {
              name: '!дебаф',
              value: `Наслать дебаф соседу за **${debuff}** ⭐. **!дебаф <игрок>**. Скорость роста его ${this.locale.getEnum('морковок')} замедлится на **50%** до **01:00 МСК**`,
              inline: true,
            },
            {
              name: '!вор',
              value: `Нанять вора, чтобы украсть пугало соседа за **${thief}** ⭐. **!вор <игрок>**`,
              inline: true,
            },
            {
              name: '!удобрение',
              value: `Купить удобрение за **${dung}** ⭐. **!удобрение**. Вы получите бонус к скорости роста ${this.locale.getEnum('морковки')} **10%** и **+1см** к росту конкурсной ${this.locale.getEnum('морковки')} за каждое увеличение до **01:00 МСК**`,
              inline: true,
            },
          );
          this.send({ embeds: [setEmbedAuthor(this.embed, user)] });
        } else {
          this.replyNoUser(user);
        }
      });
    });
  }
}
