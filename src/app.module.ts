import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WarsService } from './wars.service';
import { configService } from './config/config.service';

import { PlayerEntity } from './entities/player.entity';
import { LogEntity } from './entities/log.entity';
import { ReportEntity } from './entities/report.entity';
import { FundEntity } from './entities/fund.entity';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot(configService.getTypeOrmConfig()),
    TypeOrmModule.forFeature([
      PlayerEntity,
      LogEntity,
      ReportEntity,
      FundEntity,
    ]),
  ],
  controllers: [AppController],
  providers: [AppService, WarsService],
})
export class AppModule {}
