import Command from './Command';
import { AppService } from './../../app.service';
import { WarsService } from 'src/wars.service';

export class HelpCommand extends Command {
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
      this.embed
        .setAuthor({
          name: 'Центр помощи "Морковко"',
          iconURL:
            'https://cdn.discordapp.com/attachments/854263440474636288/1008708912633090119/787297026601254983.gif',
        })
        .setDescription(
          `Мой любимый Храм \n
          В игре нужно выращивать морковки. Морковка растет каждую минуту.  Поливая морковку, можно ускорить ее рост, +5% за каждый полив.\n
          Выращенную морковку можно обменять на очко улучшений (ОУ), 1 к 1. За ОУ можно купить новый горшок, в каждом горшке растет одна морковка, в начале игры у вас один горшок.\n
          Так же за ОУ можно увеличивать размер конкурсной морковки. Конкурсная морковка это морковка участвующая в рейтинге, в начале игры ее длина равна 1см.\n
          Выращенные морковки можно дарить друзьям, за каждую подаренную морковку ваш уровень отношений повышается на рандомное число очков отношений.\n
          Команды:`,
        )
        .addFields(
          { name: '!помощь', value: 'Список команд', inline: true },
          { name: '!начать', value: 'Участвовать в игре', inline: true },
          { name: '!выкти', value: 'Выкти из игры', inline: true },
          {
            name: '!полить',
            value: 'Полить свои морковки, доступно раз в час',
            inline: true,
          },
          {
            name: '!инвентарь',
            value: 'Узнать кол-во морковок, очков и горшков',
            inline: true,
          },
          {
            name: '!продать',
            value: 'Продать морковку за ОУ: **!продать <кол-во/все>**',
            inline: true,
          },
          {
            name: '!магазин',
            value: 'Магазин за ОУ',
            inline: true,
          },
          {
            name: '!звезды',
            value: 'Магазин звезд',
            inline: true,
          },
          {
            name: '!подарить',
            value: 'Подарить морковки другу: **!подарить <кол-во> @<никнейм>**',
            inline: true,
          },
          {
            name: '!морковка',
            value: 'Посмотреть на свою морковку',
            inline: true,
          },
          {
            name: '!топ',
            value: 'Узнать размер конкурсной морковки и место в рейтинге',
            inline: true,
          },
          {
            name: '!помолиться',
            value: 'Сходить на исповедь и помолиться святой',
            inline: true,
          },
          {
            name: '!инфо',
            value:
              'Информация о кулдаунах команд !полить и !помолиться, а так же об созревании морковки',
            inline: true,
          },
          {
            name: '!свидание',
            value: 'Сходить с кем-то на свидание',
            inline: true,
          },
          {
            name: '!игрок',
            value:
              'Посмотреть информацию об игроке, его морковку, узнать уровень отношений. **!игрок @<никнейм>**',
            inline: true,
          },
          {
            name: '!пожертвовать',
            value:
              'Пожертвовать в фонд викторины морковки. **!пожертвовать <кол-во>**',
            inline: true,
          },
          {
            name: '!статистика',
            value: 'Игровая статистика.',
            inline: true,
          },
        )
        .setImage('https://aspectro.pw/img/morkovko_github.png');
      this.send({ embeds: [this.embed] });
    });
  }
}
