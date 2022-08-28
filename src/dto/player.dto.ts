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
  slots: Slot[];
  hasPugalo: boolean;
  relations: Relation[];
  progressBonus: number;
  config: Config;
}

export interface PlayerReqDTO {
  id?: string;
  userId: string;
  carrotCount?: number;
  points?: number;
  carrotSize?: number;
  carrotAvatar?: string;
  lastWateringDate?: Date;
  lastPrayDate?: Date;
  lastADate?: Date;
  creationDate?: Date;
  slots: Slot[];
  hasPugalo?: boolean;
  relations?: Relation[];
  progressBonus?: number;
  config?: Config;
}
