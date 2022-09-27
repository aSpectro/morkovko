import Command from './Command';
import { abbreviateNumber, setEmbedAuthor } from './helpers';
import { AppService } from './../../app.service';
import { WarsService } from 'src/wars.service';

export class ExitCommand extends Command {
  constructor(commandName: string, warsService: WarsService) {
    super(commandName, warsService);
  }

  run(
    message: any,
    args: any,
    service: AppService,
    isSlash: boolean | undefined,
  ) {
    this.initCommand(message, args, service, isSlash, () => {
      const user = this.getUser();
      service.checkUser(user.id).then(async (res) => {
        if (res.status === 200) {
          const player = res.player;
          const userFriends = player.relations;
          const exitPing = () => {
            const mentions = userFriends.map((m) => `<@${m.userId}>`).join(' ');
            this.send(
              `${mentions} Ваш друг хочет выкти, подарите ему морковок!`,
            );
          };

          const exitResult = async (battle?) => {
            let resBattle = '';
            if (battle && battle.status === 200) {
              resBattle = `**Результаты битвы с боссом: ${
                battle.status === 200 ? 'Победа' : 'Поражение'
              }**\nОпыта получено: ${abbreviateNumber(
                battle.result.player.exp,
              )} ⚪\nЗдоровье босса: ${abbreviateNumber(
                battle.result.boss.healthCount,
              )} 💚`;
            } else if (battle && battle.status === 400) {
              resBattle = `**Результаты битвы с боссом: ${
                battle.status === 200 ? 'Победа' : 'Поражение'
              }**\nОпыта получено: ${abbreviateNumber(
                battle.result.player.exp,
              )} ⚪\nЗдоровье босса: ${abbreviateNumber(
                battle.result.boss.healthCount,
              )} 💚`;
              this.embed.setDescription(
                `${resBattle}\n**Победи босса, чтобы выкти!**`,
              );
              this.send({
                embeds: [setEmbedAuthor(this.embed, user)],
              });
              return;
            }
            this.resetPlayer(player);
            player.progressBonus += 1;
            player.stars += this.config.bot.economy.exitStars;
            const resSave = await this.service.savePlayer(player);
            if (resSave.status === 200) {
              this.embed.setDescription(
                `Твоя морковка достаточно большая, ты успешно вышел из игры, твой прогресс был сброшен! Поздравляю 💚!\n
                Теперь у тебя постоянный бонус ${player.progressBonus}% к скорости роста морковки и x${player.progressBonus} кол-ву выращенной морковки и за молитву.\n
                Так же ты получил **${this.config.bot.economy.exitStars}**⭐. Звезды можно обменять в специальном магазине на доп. бонусы.\n${resBattle}`,
              );
              this.send({
                embeds: [setEmbedAuthor(this.embed, user)],
              });
            } else {
              exitPing();
            }
          };

          if (userFriends && userFriends.length > 0) {
            if (
              player.carrotSize >= this.getExitCarrotSize(player.progressBonus)
            ) {
              let needBoss = false;
              if (player.progressBonus >= 3) {
                needBoss = true;
              }

              if (needBoss) {
                if (!player.wars.bossBonus) {
                  this.createBoss(player);
                }
                const battle = await this.wars.initBattle(player);
                if (battle.status === 200) {
                  await this.createBoss(player);
                  await this.setHeroesExp(player, battle.result.player.exp);
                } else {
                  await this.setHeroesExp(player, battle.result.player.exp);
                }

                exitResult(battle);
              } else {
                exitResult();
              }
            } else {
              exitPing();
            }
          } else {
            this.embed.setDescription(`У тебя нет друзей, чтобы выкти.`);
            this.send({
              embeds: [setEmbedAuthor(this.embed, user)],
            });
          }
        } else {
          this.replyNoUser(user);
        }
      });
    });
  }
}
