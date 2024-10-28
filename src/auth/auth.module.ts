
import { PassportModule } from '@nestjs/passport';
import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from './entities/account.entity';
import { TokenService } from './services/token.service';
import { TokenRepository } from './repos/token.repository';
import { AuthController } from './auth.controller';
import { Token } from './entities/token.entity';


@Module({
  imports: [ TypeOrmModule.forFeature([Account,TokenRepository,Token, TokenRepository]) ,
    UsersModule, PassportModule,JwtModule.register({
  }),],
  // Register Account entity and repository
  providers: [AuthService, JwtStrategy,TokenService,TokenRepository],
  controllers:[AuthController],
  exports:[AuthService,TokenService]
})
export class AuthModule {}

