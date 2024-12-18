
import { PassportModule } from '@nestjs/passport';
import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from './entities/account.entity';
import { TokenRepository } from '../shared/repos/token.repository';
import { AuthController } from './auth.controller';
import { Token } from './entities/token.entity';
import { SharedModule } from 'src/shared/shared.module';
import { JwtAuthGuard } from './guards/jwt-auth.guard';


@Module({
  imports: [ TypeOrmModule.forFeature([Account,Token]) ,
  SharedModule,
    UsersModule, PassportModule,JwtModule.register({
  }),],
  // Register Account entity and repository
  providers: [AuthService, JwtStrategy,JwtAuthGuard],
  controllers:[AuthController],
  exports:[AuthService,JwtAuthGuard]
})
export class AuthModule {}

