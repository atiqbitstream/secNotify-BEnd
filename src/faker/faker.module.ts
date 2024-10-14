import { Module } from '@nestjs/common';
import { FakerService } from './faker.service';
import { FakerController } from './faker.controller';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';

@Module({
  imports:[UsersModule],
  controllers: [FakerController],
  providers: [FakerService],
})
export class FakerModule {}
