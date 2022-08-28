import { Routes, SlashCommandBuilder } from 'discord.js';
import { REST } from '@discordjs/rest';

export function registerSlashCommands(clientId, guildId, token) {
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
        'Купить пугало, которое отпугивает мафию, но в обед и полночь ваш сосед ворует ваше пугало',
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
      .setDescription('Купить горшок.')
      .addStringOption((option) =>
        option
          .setName('кол-во')
          .setDescription('Кол-во горшков')
          .setRequired(true),
      ),
    new SlashCommandBuilder()
      .setName('увеличить')
      .setDescription('Увеличить конкурсную морковку. !увеличить <кол-во>')
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
