import { Module } from '@nestjs/common';
import { NFTService } from './nft.service';

@Module({
  providers: [NFTService],
})
export class NFTModule {}
