import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createTokenDto } from '../dtos/create-token.dto';
import { addSeconds } from 'src/utils/dates';
import { Token } from '../entities/token.entity';
import { LessThan } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { TokenRepository } from '../repos/token.repository';
import { User } from '../../users/entities/user.entity';
import { ETokenType } from '../enums/token-type.enum';
import { DayInMilliseconds } from 'src/utils/constants';
import { JwtToken } from '../dtos/jwt-token.dto';

@Injectable()
export class TokenService {

  constructor(
    private tokenRepository: TokenRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async create(user: User): Promise<JwtToken> {
    try {
      const accessSecret = this.configService.get<string>('JWT_ACCESS_SECRET');
  const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');
  const accessExpiration = this.configService.get<number>('JWT_ACCESS_EXPIRATION');
  const refreshExpiration = this.configService.get<number>('JWT_REFRESH_EXPIRATION');

  // Check if all required secrets and expiration values are available
  if (!accessSecret || !refreshSecret || !accessExpiration || !refreshExpiration) {
    throw new Error('JWT secrets or expiration times are not defined in the configuration.');
  }
      const sessionId = uuidv4();
      const payload: Partial<User> = {
        id: user.id,
        role: user.role,
        email: user.email,
      };

      const accessTokenDto = new createTokenDto(
        user,
        ETokenType.ACCESS,
        Number(accessExpiration),
        this.jwtService.sign(payload, { secret: accessSecret }),
        sessionId
      );
      const refreshTokenDto = new createTokenDto(
        user,
        ETokenType.REFRESH,
        Number(refreshExpiration),
        this.jwtService.sign(payload, { secret: refreshSecret }),
        sessionId
      );
      await this.tokenRepository.saveTokens(
        this.tokenRepository.create(accessTokenDto),
        this.tokenRepository.create(refreshTokenDto)
      );
      return {
        accessToken: accessTokenDto.token,
        refreshToken: refreshTokenDto.token,
        sessionId
      };
    } catch (err) {
      console.log('TokenService, create =>', err);
 
    }
  }

  async findTokenAndCheckIfExpire(token: string): Promise<Token> {
    try {
      const tokenDoc = await this.tokenRepository.findOne({ where: { token }, relations: ['user'] });

      console.log(" tokenDoc : ",tokenDoc)

      if (!tokenDoc) {
        throw new UnauthorizedException('Invalid credentials');
      }
      // TODO: include date check in db-config.ts query
      TokenService.isExpired(tokenDoc.expirationTime);
      return tokenDoc;
    }
    catch (err) {
      console.log('TokenService, findTokenAndCheckIfExpire =>', err);
      
    }
  }

  private static isExpired(expirationTime: Date): void {
    const now = new Date();
    if (expirationTime.getTime() < now.getTime()) {
      throw new UnauthorizedException('Session is expired');
    }
  }

//   async update(oldRefreshToken: string, customPayload: Partial<LogInAsJwtPayload>): Promise<JwtToken> {
//     try {
//       const { accessSecret, refreshSecret, accessExpiration, refreshExpiration } = this.configService.get('jwt');
//       const refreshTokenDoc = await this.findTokenAndCheckIfExpire(oldRefreshToken);

//       let accessTokenDoc = await this.tokenRepository.findOneBy({
//         sessionId: refreshTokenDoc.sessionId,
//         tokenType: ETokenType.ACCESS
//       });

//       if (!accessTokenDoc) {
//         const accessDto = new createTokenDto(
//           refreshTokenDoc.user,
//           ETokenType.ACCESS,
//           Number(accessExpiration),
//           this.jwtService.sign(customPayload, { secret: accessSecret }),
//           refreshTokenDoc.sessionId
//         );

//         accessTokenDoc = this.tokenRepository.create(accessDto);
//       }

//       const now = new Date();
//       refreshTokenDoc.token = this.jwtService.sign(customPayload, { secret: refreshSecret });
//       refreshTokenDoc.expirationTime = addSeconds(now, refreshExpiration);

//       accessTokenDoc.token = this.jwtService.sign(customPayload, { secret: accessSecret });
//       accessTokenDoc.expirationTime = addSeconds(now, accessExpiration);

//       await this.tokenRepository.saveTokens(accessTokenDoc, refreshTokenDoc);
//       return { accessToken: accessTokenDoc.token, refreshToken: refreshTokenDoc.token };
//     } catch (err) {
//       console.log('TokenService, Updation =>', err);
//       this.logger.error(`TokenService Updation => ${err.message}`, err.stack);
//     }
//   }

//   @Cron(CronExpression.EVERY_DAY_AT_9AM)
//   async deleteExpiredTokens(): Promise<void> {
//     const expiredForWeek = new Date(new Date().getTime() - DayInMilliseconds);
//     const tokens = await this.tokenRepository.findBy({ expirationTime: LessThan(expiredForWeek) });
//     await this.tokenRepository.remove(tokens);
//   }

  async removeTokensOnLogout(refreshToken: string): Promise<void> {
    await this.tokenRepository.removeTokens(refreshToken);
  }

  async removeOtherTokensOnLogin(sessionId: string, userId: number): Promise<any> {
    return this.tokenRepository.removeOtherTokens(sessionId, userId);
  }

  async verifyToken()
  {
       return true;
  }
}
