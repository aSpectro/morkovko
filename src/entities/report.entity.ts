import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

import { LogDTO } from '../dto/log.dto';

@Entity()
export class ReportEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 200, nullable: false })
  userId: string;

  @Column({ type: 'int4', nullable: false })
  fineCount: number;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  reportDate: Date;

  @Column({ type: 'jsonb' })
  commandsLogs: { [key: string]: LogDTO[] };
}
