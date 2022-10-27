import { BonusType } from 'src/enums';
import { Hero } from 'src/helpers/heroes';

export interface Slot {
  progress: number;
  factor: number;
}

export interface Relation {
  userId: string;
  level: number;
}

export interface Wars {
  bossBonus?: {
    type: BonusType;
    size: number;
  };
  lastAttackDate?: Date;
  heroes: { name: string; level: number; exp: number; hero?: Hero }[];
}

export interface Reward {
  stars?: number;
  carrots?: number;
  exp?: number;
}

export interface Config {
  fair?: {
    isActive: boolean;
    startDate: Date;
    reward: Reward;
  };
  promocodes?: string[];
  autoBuyPugalo: boolean;
  slotSpeedUpdate: number;
  cooldowns: {
    adate: number;
    watering: number;
    pray: number;
  };
  isDonateToday: boolean;
  stars: {
    isDung: boolean;
    isThief: boolean;
    isDebuff: boolean;
  };
  debuffs: number;
}

export interface PlayerDTO {
  id: string;
  userId: string;
  carrotCount: number;
  points: number;
  carrotSize: number;
  carrotCountBig: number;
  pointsBig: number;
  carrotSizeBig: number;
  carrotAvatar: string;
  pumpkinAvatar: string;
  lastWateringDate: Date;
  lastPrayDate: Date;
  lastADate: Date;
  creationDate: Date;
  hasPugalo: boolean;
  relations: Relation[];
  progressBonus: number;
  config: Config;
  dailyGiftCount: number;
  factorSpeed: number;
  slotsCount: number;
  stars: number;
  slotsCountBig: number;
  starsBig: number;
  dailyWateringCount: number;
  policeReportCount: number;
  wars: Wars;
}

export interface PlayerReqDTO {
  userId: string;
  carrotAvatar?: string;
  pumpkinAvatar?: string;
  lastWateringDate?: Date;
  lastPrayDate?: Date;
  lastADate?: Date;
}
