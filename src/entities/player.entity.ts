import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

import { Slot, Relation } from '../dto/player.dto';

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
}

// id - uuid
// userId - id discord
// carrotCount - carrots count
// points - points count
// slots [
//   {
//     progress - % роста
//     factor - % ускорения
//   }
// ]
// carrotSize - размер морковки на конкурс (в см?)
// carrotAvatar - на будущее для генерации аватарок морковок