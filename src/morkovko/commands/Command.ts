import { EmbedBuilder, ColorResolvable } from 'discord.js';
import { noUserEmbed, randomIntFromInterval } from './helpers';
import config from '../config';
import { AppService } from './../../app.service';

export default abstract class Command {
  public commandName: string;
  public isSlash: boolean;
  public service: AppService;
  public args: any;
  public message: any;
  public embed: EmbedBuilder;
  public config;

  constructor(commandName: string) {
    this.commandName = commandName;
    this.config = config;
  }

  public get name() {
    return this.commandName;
  }

  public async send(messageData) {
    if (this.isSlash) await this.message.reply(messageData).catch();
    else
      await this.message.channel.send(messageData).catch(() => console.log(''));
  }

  public initCommand(
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

    return callBack();
  }

  public getUser() {
    return this.isSlash ? this.message.user : this.message.author;
  }

  public replyNoUser(user, troll?) {
    if (troll) {

    }
    this.send({ embeds: [noUserEmbed(user)] });
  }

  public getArgString(argName) {
    return this.isSlash
      ? Math.abs(parseInt(this.args.getString(argName)))
      : Math.abs(parseInt(this.args[0]));
  }

  public getArgUser(argName) {
    return this.isSlash
      ? this.args.getUser(argName)
      : this.message.mentions.users.first();
  }

  public getRandomAvatar() {
    const carrotNum = randomIntFromInterval(1, this.config.bot.carrotsLimit);
    return `./outputs/carrots/${carrotNum}.png`;
  }

  public resetPlayer(player) {
    player.carrotSize = 1;
    player.carrotCount = 0;
    player.points = 0;
    player.hasPugalo = false;
    player.relations = [];
    player.slots = [
      {
        progress: 0,
        factor: 0,
      },
    ];
    return player;
  }
}
