import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

import { Slot, Relation, Config } from '../dto/player.dto';

const config = {
  autoBuyPugalo: false,
  slotSpeedUpdate: 0,
  cooldowns: {
    adate: 0,
    watering: 0,
    pray: 0,
  },
};

@Entity()
export class PlayerEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 200, nullable: false, unique: true })
  userId: string;

  @Column({ type: 'int4', nullable: false, default: 0 })
  carrotCount: number;

  @Column({ type: 'int4', nullable: false, default: 0 })
  points: number;

  @Column({ type: 'int4', nullable: false, default: 1 })
  carrotSize: number;

  @Column({ type: 'int4', nullable: false, default: 1 })
  progressBonus: number;

  @Column({ type: 'boolean', nullable: false, default: false })
  hasPugalo: boolean;

  @Column({ type: 'varchar', length: 200, default: './outputs/carrots/1.png' })
  carrotAvatar: string;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  lastWateringDate: Date;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  lastPrayDate: Date;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  lastADate: Date;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  creationDate: Date;

  @Column({ type: 'jsonb' })
  slots: Slot[];

  @Column({ type: 'jsonb', nullable: true })
  relations: Relation[];

  @Column({ type: 'jsonb', default: config })
  config: Config;
}
