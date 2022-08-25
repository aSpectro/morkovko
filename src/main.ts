import {
  Client,
  Collection,
  ActivityType,
  GatewayIntentBits,
  Routes,
  SlashCommandBuilder,
} from 'discord.js';
import { NestFactory } from '@nestjs/core';
import { REST } from '@discordjs/rest';

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

function registerSlashCommands(clientId, guildId, token) {
  const commands = [
    new SlashCommandBuilder().setName('помощь').setDescription('Список команд'),
    new SlashCommandBuilder()
      .setName('начать')
      .setDescription('Участвовать в игре'),
    new SlashCommandBuilder().setName('выкти').setDescription('Выкти из игры'),
    new SlashCommandBuilder()
      .setName('полить')
      .setDescription('Полить свои морковки, доступно раз в час'),
    new SlashCommandBuilder()
      .setName('инвентарь')
      .setDescription('Узнать кол-во морковок, очков и горшков'),
    new SlashCommandBuilder()
      .setName('магазин')
      .setDescription('Магазин за ОУ'),
    new SlashCommandBuilder()
      .setName('пугало')
      .setDescription(
        'Купить пугало за 1 🔸, которое отпугивает мафию, но в обед и полночь ваш сосед ворует ваше пугало',
      ),
    new SlashCommandBuilder()
      .setName('подарить')
      .setDescription('Подарить морковки другу: !подарить <кол-во> @<никнейм>')
      .addStringOption((option) =>
        option
          .setName('кол-во')
          .setDescription('Кол-во морковок')
          .setRequired(true),
      )
      .addUserOption((option) =>
        option
          .setName('игрок')
          .setDescription('Игрок, которому ты хочешь подарить морковки')
          .setRequired(true),
      ),
    new SlashCommandBuilder()
      .setName('игрок')
      .setDescription(
        'Посмотреть информацию об игроке, узнать уровень дружбы, его морковку. !игрок @<никнейм>',
      )
      .addUserOption((option) =>
        option
          .setName('игрок')
          .setDescription('Игрок, информацию о котором ты хочешь посмотреть')
          .setRequired(true),
      ),
    new SlashCommandBuilder()
      .setName('морковка')
      .setDescription('Посмотреть на свою морковку'),
    new SlashCommandBuilder()
      .setName('свидание')
      .setDescription('Сходить с кем-то на свидание'),
    new SlashCommandBuilder()
      .setName('топ')
      .setDescription('Узнать размер конкурсной морковки и место в рейтинге'),
    new SlashCommandBuilder()
      .setName('помолиться')
      .setDescription('Сходить на исповедь и помолиться святой'),
    new SlashCommandBuilder()
      .setName('инфо')
      .setDescription(
        'Информация о кулдаунах команд !полить и !помолиться, а так же об созревании морковки',
      ),
    new SlashCommandBuilder()
      .setName('продать')
      .setDescription('Продать морковки за 🔸. !продать <кол-во>')
      .addStringOption((option) =>
        option
          .setName('кол-во')
          .setDescription('Кол-во морковок')
          .setRequired(true),
      ),
    new SlashCommandBuilder()
      .setName('купить')
      .setDescription('Купить горшок за 3 🔸.')
      .addStringOption((option) =>
        option
          .setName('кол-во')
          .setDescription('Кол-во горшков')
          .setRequired(true),
      ),
    new SlashCommandBuilder()
      .setName('увеличить')
      .setDescription(
        'Увеличить конкурсную морковку за **5🔸** на 1см. !увеличить <кол-во>',
      )
      .addStringOption((option) =>
        option.setName('кол-во').setDescription('Кол-во раз').setRequired(true),
      ),
  ].map((command) => command.toJSON());

  const rest = new REST({ version: '10' }).setToken(token);

  rest
    .put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
    .then(() => console.log('Successfully registered application commands.'))
    .catch(console.error);
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
