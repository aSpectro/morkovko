import { EmbedBuilder, ColorResolvable } from 'discord.js';
import * as fs from 'fs';
import { noUserEmbed, randomIntFromInterval, setEmbedAuthor, abbreviateNumber } from './helpers';
import config from '../config';
import { AppService } from './../../app.service';
import { LogDTO } from '../../dto/log.dto';
import { PlayerDTO } from '../../dto/player.dto';
import { WarsService } from './../../wars.service';
import { BonusType, Currency, Mutations } from './../../enums';
import { Hero } from './../../helpers/heroes';
import random from 'src/helpers/random';
import locale from 'src/modes';
import { Locale } from 'src/modes/locale';

export default class Command {
  public commandName: string;
  public isSlash: boolean;
  public service: AppService;
  public args: any;
  public message: any;
  public embed: EmbedBuilder;
  public wars: WarsService;
  public config;
  public locale: Locale = locale;
  private errors: string[] = [];
  private needEvents: boolean;

  constructor(commandName: string, needEvents: boolean, warsSerive?: WarsService) {
    this.commandName = commandName;
    this.wars = warsSerive;
    this.needEvents = needEvents;
    this.config = config;
  }

  public get name() {
    return this.commandName;
  }

  public async send(messageData) {
    if (this.isSlash) await this.message.reply(messageData).catch();
    else
      await this.message.reply(messageData).catch(() => console.log(''));
  }

  public async initCommand(
    message: any,
    args: any,
    service: AppService,
    isSlash: boolean | undefined,
    callBack,
  ) {
    this.message = message;
    this.args = args;
    this.service = service;
    this.isSlash = isSlash ? isSlash : false;
    this.embed = new EmbedBuilder().setColor(
      config.bot.badgeColor as ColorResolvable,
    );

    const mention = this.getArgUser('игрок')
    const count = this.getArgString('кол-во')

    const logData: LogDTO = {
      userId: this.getUser().id,
      commandName: this.name,
      arguments: {}
    }

    if (mention) logData.arguments.mention = mention;
    if (count) logData.arguments.count = count;
    const log = await this.service.log(logData);

    if (log.status === 200) {
      const res = await this.service.checkUser(this.getUser().id);
      if (this.needEvents && res.status === 200 && !res.player.config?.fair?.isActive) {
        this.embed.setDescription(
          `Ты не можешь использовать эту команду, тебе нужно участвовать в ярмарке или квесте!\n**!ярмарка**`,
        );
        this.send({
          embeds: [setEmbedAuthor(this.embed, this.getUser())],
        });
        return;
      }
      return callBack();
    }
    return;
  }

  public getUser() {
    return this.isSlash ? this.message.user : this.message.author;
  }

  public replyNoUser(user, troll?) {
    if (troll) {

    }
    this.send({ embeds: [noUserEmbed(user)] });
  }

  public getArgByIndex(index) {
    return this.args[index];
  }

  public getArgString(argName) {
    return this.isSlash
      ? Math.abs(parseInt(this.args.getString(argName)))
      : Math.abs(parseInt(this.args[0]));
  }

  public getArgAll(argName) {
    let arg;
    if (this.isSlash) {
      arg = this.args.getString(argName);
    } else {
      arg = this.args[0];
    }

    return (arg === 'все' || arg === 'всё') ? 'all' : Math.abs(parseInt(arg)) as any;
  }

  public getArgUser(argName) {
    return this.isSlash
      ? this.args.getUser(argName)
      : this.message.mentions.users.first();
  }

  public getRandomAvatar(mutation: Mutations) {
    const num = randomIntFromInterval(1, fs.readdirSync(`./outputs/${mutation}`).length);
    const veg = mutation;
    return `./outputs/${veg}/${num}.png`;
  }

  public resetPlayer(player: PlayerDTO) {
    player.carrotSize = 1;
    player.carrotCount = 0;
    player.points = 0;
    player.hasPugalo = false;
    player.slotsCount = 1;
    player.config.autoBuyPugalo = false;
    player.config.slotSpeedUpdate = 0;
    player.config.cooldowns.adate = 0;
    player.config.cooldowns.watering = 0;
    player.config.cooldowns.pray = 0;
    return player;
  }

  public getPrice(factor, price, progressBonus?) {
    let res = Math.round((factor / 50) * price + price);
    if (progressBonus) {
      res += (res / 10) * progressBonus;
    }
    return res;
  }

  public getExitCarrotSize(currentProgress) {
    if (currentProgress === 1) return 100;
    return currentProgress * 30 + 100;
  }

  public canBuy(carrotSize, key, boostCount, count?) {
    if (boostCount >= 50) {
      return false;
    }
    if (count && boostCount + count > 50) {
      return false;
    }
    if (carrotSize >= this.config.bot.economy.shopRules[key]) {
      return true;
    }
    return;
  }

  public addError(errorMessage: string) {
    this.errors.push(errorMessage);
  }

  // TODO: отрефакторить вывод всех ошибок во всех командах
  public catchErrors(): Promise<{ send: Function }> {
    return new Promise((resolve) => {
      if (this.errors.length > 0) {
        this.embed.setDescription(this.errors[0]);
      }
      const sendResponse = () => {
        this.send({
          embeds: [setEmbedAuthor(this.embed, this.getUser())],
        });
      }

      this.errors = [];
      resolve({ send: sendResponse });
    });
  }

  // TODO: отрефакторить проверку во всех командах
  public checkUserHasCurrency(price: number, currency: Currency, player: PlayerDTO): { isHas: boolean; error: string|boolean } {
    let isHas = true;
    let error: string|boolean = false;
    if (currency === Currency.carrots && player.carrotCount < price) {
      isHas = false;
      error = `Тебе не хватает **${abbreviateNumber(
        price - player.carrotCount,
      )}** ${this.locale.getCurrency()}!`;
    } else if (currency === Currency.stars && player.stars < price) {
      isHas = false;
      error = `Тебе не хватает **${abbreviateNumber(
        price - player.carrotCount,
      )}** ⭐!`;
    }
    return { isHas, error }
  }

  public async buyHero(player: PlayerDTO, hero: Hero, currency: Currency) {
    if (currency === Currency.carrots) {
      player.carrotCount -= hero.price;
    } else if (currency === Currency.stars) {
      player.stars -= hero.price;
    }

    player.wars.heroes.push({ name: hero.name, level: 1, exp: 0 })
    return await this.service.savePlayer(player);
  }

  public async upgradeHero(player: PlayerDTO, hero: Hero, count: number) {
    const playerHero = player.wars.heroes.find((f) => f.name === hero.name);
    player.carrotCount -= hero.getUpgradePrice(count);
    playerHero.exp -= hero.getNeedUpgradeExp(count);
    playerHero.level += count;
    return await this.service.savePlayer(player);
  }

  public async createBoss(player: PlayerDTO) {
    const bonuses = config.bot.wars.bonuses;
    const bonus = bonuses[Math.floor(random.float() * bonuses.length)]
    player.wars.bossBonus = {
      type: bonus[0] as BonusType,
      size: bonus[1] as number
    };
    return await this.service.savePlayer(player);
  }

  public async setHeroesExp(player: PlayerDTO, exp: number) {
    const heroes = player.wars.heroes;
    const avgExp = Math.round(exp / heroes.length);
    heroes.forEach((hero) => {
      hero.exp += avgExp;
    });
    return await this.service.savePlayer(player);
  }

  public getMaxAllCount(player: PlayerDTO, isUpgrade?: boolean): Promise<number> {
    return new Promise((resolve) => {
      let res = 0;
      let slots = player.slotsCount;
      let points = player.points;
      const max = 1000000;
      const calc = () => {
        const price = this.getPrice(slots, config.bot.economy.upgrade);
        points -= price;
        if (points >= 0 && res < max) {
          res += 1;
          if (isUpgrade) {
            slots += 1;
          }
          setTimeout(() => {
            calc();
          }, 0);
        } else {
          resolve(res);
        }
      }
      calc();
    });
  }

  public getAllPrice(player: PlayerDTO, count: number, isUpgrade?: boolean): number {
    let res = 0;
    let slots = player.slotsCount;
    for (let i = 0; i < count; i++) {
      const price = this.getPrice(slots, config.bot.economy.upgrade);
      res += price;
      if (isUpgrade) {
        slots += 1;
      }
    }
    return res;
  }
}
