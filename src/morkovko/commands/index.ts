import { PingCommand } from './ping';
import { HelpCommand } from './help';
import { StartCommand } from './start';
import { WateringCommand } from './watering';
import { InventoryCommand } from './inventory';
import { ShopCommand } from './shop';
import { SellCommand } from './sell';
import { UpgradeCommand } from './upgrade';
import { GiftCommand } from './gift';
import { PrayCommand } from './pray';
import { CarrotCommand } from './carrot';
import { ExitCommand } from './exit';
import { BuyCommand } from './buy';
import { TopCommand } from './top';
import { InfoCommand } from './info';
import { AdateCommand } from './adate';
import { FriendCommand } from './friend';
import { PugaloCommand } from './pugalo';
import { ABPCommand } from './autoBuyPugalo';
import { GRCommand } from './growthRate';
import { CACommand } from './cooldownAdate';
import { CWCommand } from './cooldownWatering';
import { CPCommand } from './cooldownPray';
import { DonateCommand } from './donate';
import { StatsCommand } from './stats';
import { StarsCommand } from './stars';
import { DungCommand } from './dung';
import { DebufCommand } from './debuf';
import { ThiefCommand } from './thief';

//wars
import { HeroesShopCommand } from './wars/heroesShop';
import { HeroCommand } from './wars/hero';
import { PubCommand } from './wars/pub';
import { BossCommand } from './wars/boss';

import { NCCommand } from './admin/nc'; // обнулить морковки
import { NPCommand } from './admin/np'; // обнулить очки
import { GCCommand } from './admin/gc'; // выдать морковки игроку
import { GPCommand } from './admin/gp'; // выдать очки игроку
import { GSCommand } from './admin/gs'; // выдать горшки игроку

import { WarsService } from './../../wars.service';

export function CommandList(wars: WarsService) {
  return [
    new StartCommand('начать'),
    new PingCommand('ping'),
    new HelpCommand('помощь'),
    new WateringCommand('полить'),
    new InventoryCommand('инвентарь'),
    new ShopCommand('магазин'),
    new SellCommand('продать'),
    new UpgradeCommand('увеличить'),
    new GiftCommand('подарить'),
    new PrayCommand('помолиться'),
    new CarrotCommand('морковка'),
    new ExitCommand('выкти', wars),
    new BuyCommand('купить'),
    new TopCommand('топ'),
    new InfoCommand('инфо'),
    new AdateCommand('свидание'),
    new FriendCommand('игрок'),
    new PugaloCommand('пугало'),
    new ABPCommand('автопокупка-пугала'),
    new GRCommand('скорость-роста'),
    new CACommand('кулдаун-свидание'),
    new CWCommand('кулдаун-полив'),
    new CPCommand('кулдаун-молитва'),
    new DonateCommand('пожертвовать'),
    new StatsCommand('статистика'),
    new StarsCommand('звезды'),
    new DungCommand('удобрение'),
    new DebufCommand('дебаф'),
    new ThiefCommand('вор'),
    //wars
    new HeroesShopCommand('герои'),
    new HeroCommand('герой'),
    new PubCommand('паб'),
    new BossCommand('босс'),
    // admin commands
    new NCCommand('nc'),
    new NPCommand('np'),
    new GCCommand('gc'),
    new GPCommand('gp'),
    new GSCommand('gs'),
  ];
}
