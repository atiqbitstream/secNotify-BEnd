import { Module } from '@nestjs/common';
import { RiderService } from './rider.service';
import { RiderController } from './rider.controller';

@Module({
  controllers: [RiderController],
  providers: [RiderService],
})
export class RiderModule {}
