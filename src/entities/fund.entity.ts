import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class FundEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int4', nullable: false, default: 0 })
  fundSize: number;
}
