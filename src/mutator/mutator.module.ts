import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { configService } from './../config/config.service';
import { MutatorService } from './mutator.service';
import { PlayerEntity } from './../entities/player.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot(configService.getTypeOrmConfig()),
    TypeOrmModule.forFeature([PlayerEntity]),
  ],
  providers: [MutatorService],
})
export class MutatorModule {}
