import {
  Client,
  Collection,
  ActivityType,
  GatewayIntentBits,
} from 'discord.js';
import { NestFactory } from '@nestjs/core';
import { registerSlashCommands } from './morkovko/commands/slashCommands';

import { AppService } from './app.service';
import { AppModule } from './app.module';
import { NFTService } from './nft/nft.service';
import { NFTModule } from './nft/nft.module';

import config from './morkovko/config';
import { configService } from './config/config.service';
import commandsList from './morkovko/commands';
interface ClientModel extends Client {
  commands: Collection<any, any>;
}
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
  ],
}) as ClientModel;
client.commands = new Collection();
for (const command of commandsList) {
  client.commands.set(command.name, command);
}

async function MorkovkoApp() {
  const app = await NestFactory.create(AppModule);
  await app.listen(configService.getPort());
  const service = app.get<AppService>(AppService);
  registerSlashCommands(
    config.bot.clientId,
    config.bot.guildId,
    config.bot.token,
  );

  try {
    client.on('ready', () => {
      client.user.setActivity(config.bot.rpc, {
        type: ActivityType.Watching,
      });

      setInterval(() => {
        service.getUsersIds().then((res) => {
          if (res.status === 200) {
            const userId =
              res.data[Math.floor(Math.random() * res.data.length)];
            client.users.fetch(userId).then((user) => {
              client.user.setActivity(`за очком ${user.username}`, {
                type: ActivityType.Watching,
              });
            });
          }
        });
      }, 300000);
      service.setClient(client);
      console.log('Morkovko bot ready!');
    });

    client.on('interactionCreate', async (interaction) => {
      if (
        !interaction.isChatInputCommand() ||
        (configService.isProduction() &&
          interaction.channel.id !== configService.getMorkovkoChannel()) ||
        !configService.isProduction()
      )
        return;
      const commandController = client.commands.get(interaction.commandName);
      const args = interaction.options;
      if (commandController) {
        try {
          await commandController.run(interaction, args, service, true);
        } catch (err) {
          //
        }
      }
    });

    client.on('messageCreate', async (message) => {
      // console.log(message.channel.id);
      const prefix = config.bot.prefix;

      if (
        !message.content.startsWith(prefix) ||
        message.author.bot ||
        message.author.system ||
        (configService.isProduction() &&
          message.channel.id !== configService.getMorkovkoChannel())
      )
        return;

      const messageArray = message.content.split(' ');
      const command = messageArray[0];
      const args = messageArray.slice(1);
      const commandController = client.commands.get(
        command.slice(prefix.length).trimStart().toLowerCase(),
      );
      if (commandController) {
        try {
          await commandController.run(message, args, service);
        } catch (err) {
          //
        }
      }
    });

    client.login(config.bot.token);
  } catch (error) {
    console.log(error);
  }
}
MorkovkoApp();

async function MorkovkoNFT() {
  const app = await NestFactory.create(NFTModule);
  await app.listen(8112);
  const service = app.get<NFTService>(NFTService);
  service.createImages();
}
// MorkovkoNFT();
