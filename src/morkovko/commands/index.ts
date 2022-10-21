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
import { FairCommand } from './fair';
import { PromocodeCommand } from './promocode';

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
    new StartCommand('начать', false),
    new PingCommand('ping', false),
    new HelpCommand('помощь', false),
    new WateringCommand('полить', false),
    new InventoryCommand('инвентарь', false),
    new ShopCommand('магазин', false),
    new SellCommand('продать', false),
    new UpgradeCommand('увеличить', false),
    new GiftCommand('подарить', false),
    new PrayCommand('помолиться', false),
    new CarrotCommand('морковка', false),
    new ExitCommand('выкти', false),
    new BuyCommand('купить', false),
    new TopCommand('топ', false),
    new InfoCommand('инфо', false),
    new AdateCommand('свидание', false),
    new FriendCommand('игрок', false),
    new PugaloCommand('пугало', true),
    new ABPCommand('автопокупка-пугала', true),
    new GRCommand('скорость-роста', false),
    new CACommand('кулдаун-свидание', false),
    new CWCommand('кулдаун-полив', false),
    new CPCommand('кулдаун-молитва', false),
    new DonateCommand('пожертвовать', false),
    new StatsCommand('статистика', false),
    new StarsCommand('звезды', true),
    new DungCommand('удобрение', true),
    new DebufCommand('дебаф', true),
    new ThiefCommand('вор', true),
    new FairCommand('ярмарка', false),
    new PromocodeCommand('промокод', false),
    //wars
    new HeroesShopCommand('герои', true),
    new HeroCommand('герой', true),
    new PubCommand('паб', true),
    new BossCommand('босс', true),
    // admin commands
    new NCCommand('nc', false),
    new NPCommand('np', false),
    new GCCommand('gc', false),
    new GPCommand('gp', false),
    new GSCommand('gs', false),
  ];
}
