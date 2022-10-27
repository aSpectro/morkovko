import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Unique,
} from 'typeorm';

import { Relation, Config, Wars } from '../dto/player.dto';

const config: Config = {
  autoBuyPugalo: false,
  slotSpeedUpdate: 0,
  cooldowns: {
    adate: 0,
    watering: 0,
    pray: 0,
  },
  isDonateToday: false,
  stars: {
    isDung: false,
    isThief: false,
    isDebuff: false,
  },
  debuffs: 0,
};

const warsConfig: Wars = {
  heroes: [],
};

@Entity()
@Unique('unique_user', ['userId'])
export class PlayerEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 200, nullable: false, unique: true })
  userId: string;

  @Column({ type: 'int4', nullable: false, default: 0 })
  carrotCount: number;

  @Column({ type: 'int4', nullable: false, default: 0 })
  points: number;

  @Column({ type: 'int4', nullable: false, default: 0 })
  stars: number;

  @Column({ type: 'int4', nullable: false, default: 1 })
  carrotSize: number;

  @Column({ type: 'int4', nullable: false, default: 1 })
  slotsCount: number;

  @Column({ type: 'bigint', nullable: false, default: 0 })
  carrotCountBig: number;

  @Column({ type: 'bigint', nullable: false, default: 0 })
  pointsBig: number;

  @Column({ type: 'bigint', nullable: false, default: 0 })
  starsBig: number;

  @Column({ type: 'bigint', nullable: false, default: 0 }) // todo def 1
  carrotSizeBig: number;

  @Column({ type: 'bigint', nullable: false, default: 0 }) // todo def 1
  slotsCountBig: number;

  @Column({ type: 'int4', nullable: false, default: 1 })
  progressBonus: number;

  @Column({ type: 'int4', nullable: false, default: 3 })
  dailyGiftCount: number;

  @Column({ type: 'int4', nullable: false, default: 0 })
  dailyWateringCount: number;

  @Column({ type: 'int4', nullable: false, default: 0 })
  policeReportCount: number;

  @Column({ type: 'int4', nullable: false, default: 0 })
  factorSpeed: number;

  @Column({ type: 'boolean', nullable: false, default: false })
  hasPugalo: boolean;

  @Column({ type: 'varchar', length: 200, default: './outputs/carrots/1.png' })
  carrotAvatar: string;

  @Column({ type: 'varchar', length: 200, default: './outputs/pumpkin/1.png' })
  pumpkinAvatar: string;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  lastWateringDate: Date;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  lastPrayDate: Date;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  lastADate: Date;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  creationDate: Date;

  @Column({ type: 'jsonb', nullable: true })
  relations: Relation[];

  @Column({ type: 'jsonb', default: config })
  config: Config;

  @Column({ type: 'jsonb', default: warsConfig })
  wars: Wars;
}
