import { Module } from '@nestjs/common';
import { RedisModule } from 'nestjs-redis';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { configService } from './../config/config.service';
import { QuizService } from './quiz.service';

import { PlayerEntity } from './../entities/player.entity';
import { QuizEntity } from './../entities/quiz.entity';
import { FundEntity } from './../entities/fund.entity';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot(configService.getTypeOrmConfig()),
    TypeOrmModule.forFeature([PlayerEntity, QuizEntity, FundEntity]),
    RedisModule.register(configService.getRedisConfig()),
  ],
  providers: [QuizService],
})
export class QuizModule {}
