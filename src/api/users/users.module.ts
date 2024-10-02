import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { EmailSesModule } from '../../system-notification/email-ses/email-ses.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from './users.repository';
import { AuditModule } from '../audit/audit.module';
import { User } from './entities/user.entity';

@Module({
  imports: [EmailSesModule, TypeOrmModule.forFeature([User]), AuditModule],
  controllers: [UsersController],
  providers: [UsersService, UserRepository],
  exports: [UsersService, UserRepository, TypeOrmModule.forFeature([User])]
})
export class UsersModule {}
