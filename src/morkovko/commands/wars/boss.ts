import Command from './../Command';
import { setEmbedAuthor, abbreviateNumber } from './../helpers';
import { AppService } from './../../../app.service';
import { Boss, mapBonusDescription, Bonus } from './../../../helpers/boss';

export class BossCommand extends Command {
  constructor(commandName: string) {
    super(commandName);
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
          if (player.progressBonus < 3) {
            this.embed.setDescription(`Ты еще не достиг 3 уровня прогресса!`);
          } else {
            if (!player.wars.bossBonus) {
              await this.createBoss(player);
            }
            const bossBonus: Bonus = {
              type: player.wars.bossBonus.type,
              size: player.wars.bossBonus.size,
            };
            const boss = new Boss(player.progressBonus, bossBonus);
            const level = boss.level;

            const bonus = mapBonusDescription(
              player.wars.bossBonus.type,
              player.wars.bossBonus.size,
            );

            const stats = `💚 ${abbreviateNumber(
              boss.healthCount,
            )} | 🔺 ${abbreviateNumber(boss.attackCount)}`;
            this.embed.setDescription(
              `**Босс Мафии**\nУровень: ${level}\n${bonus}\n${stats}`,
            );
          }

          this.send({ embeds: [setEmbedAuthor(this.embed, user)] });
        } else {
          this.replyNoUser(user);
        }
      });
    });
  }
}
