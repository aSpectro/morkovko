import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

import { Arguments } from '../dto/log.dto';

@Entity()
export class LogEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 200, nullable: false })
  userId: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  commandName: string;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  executeDate: Date;

  @Column({ type: 'jsonb', default: {} })
  arguments: Arguments;

  @Column({ type: 'boolean', nullable: false, default: false })
  reported: boolean;
}
