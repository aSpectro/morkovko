import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Question } from '../dto/quiz.dto';

@Entity()
export class QuizEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'jsonb', nullable: true })
  questionData: Question;

  @Column({ type: 'boolean', nullable: false, default: false })
  isUsed: boolean;
}
