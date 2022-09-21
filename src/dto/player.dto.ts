export interface Slot {
  progress: number;
  factor: number;
}

export interface Relation {
  userId: string;
  level: number;
}

export interface Config {
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
  carrotAvatar: string;
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
  dailyWateringCount: number;
  policeReportCount: number;
}

export interface PlayerReqDTO {
  userId: string;
  carrotAvatar?: string;
  lastWateringDate?: Date;
  lastPrayDate?: Date;
  lastADate?: Date;
}
