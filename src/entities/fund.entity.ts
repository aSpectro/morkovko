import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class FundEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int4', nullable: false, default: 200000 })
  fundSize: number;

  @Column({ type: 'boolean', nullable: false, default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  creationDate: Date;
}
