import { Injectable } from '@nestjs/common';
import { configService } from './config/config.service';
import { Cron } from '@nestjs/schedule';
import config from './morkovko/config';
import { EmbedBuilder } from 'discord.js';
import {} from './morkovko/commands/helpers';
import { calcBattleResult, Result } from './helpers/wars';

import { InjectRepository } from '@nestjs/typeorm';
import * as moment from 'moment';
import { MoreThan, Repository } from 'typeorm';
import { PlayerEntity } from './entities/player.entity';
import { PlayerDTO, PlayerReqDTO } from './dto/player.dto';

const mafiaChannelId = configService.getMorkovkoChannel();

@Injectable()
export class WarsService {
  client: any;
  constructor(
    @InjectRepository(PlayerEntity)
    private playerRepository: Repository<PlayerEntity>,
  ) {}

  setClient(client: any) {
    this.client = client;
  }

  initBattle(player: PlayerDTO): Promise<{ status: number; result: Result }> {
    return new Promise((resolve) => {
      calcBattleResult(player).then((res) => {
        resolve(res);
      });
    });
  }
}
