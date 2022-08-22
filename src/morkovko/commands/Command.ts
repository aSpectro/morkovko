import { EmbedBuilder, Message, ChatInputCommandInteraction, ColorResolvable } from 'discord.js';
import { noUserEmbed, setEmbedAuthor } from './helpers';
import config from '../config';
import { AppService } from './../../app.service';

export default abstract class Command {
  public commandName: string;
  public isSlash: boolean;
  public service: AppService;
  public args: string[];
  public message: Message|ChatInputCommandInteraction;
  public embed: EmbedBuilder;

  constructor(commandName: string) {
    this.commandName = commandName;
  }

  public get name() {
    return this.commandName;
  }

  public async send(messageData) {
    if (this.isSlash) await this.message.reply(messageData).catch();
    else await (this.message as Message).channel.send(messageData).catch(() => console.log(''));
  }

  public initCommand(
    message: Message|ChatInputCommandInteraction,
    args: string[],
    service: AppService,
    isSlash: boolean|undefined,
    callBack
  ) {
    this.message = message;
    this.args = args;
    this.service = service;
    this.isSlash = isSlash ? isSlash : false;
    this.embed = new EmbedBuilder().setColor(config.bot.badgeColor as ColorResolvable);

    return callBack()
  }
}
