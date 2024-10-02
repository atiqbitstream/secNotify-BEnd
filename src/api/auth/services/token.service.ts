import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { TokenDto, JwtToken } from '../dto';
import { LogInAsJwtPayload } from '../Jwt.strategy';
import { Cron, CronExpression } from '@nestjs/schedule';
import { addSeconds } from '../../../utils/dates';
import { Token } from '../entities/token.entity';
import { LessThan } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { TokenRepository } from '../token.repository';
import { User } from '../../users/entities/user.entity';
import { ETokenType } from '../../../enums/token-type.enum';
import { DayInMilliseconds } from '../../../utils/constants';

@Injectable()
export class TokenService {
  runJobs = true;
  private readonly logger = new Logger(TokenService.name);

  constructor(
    private tokenRepository: TokenRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async create(user: User, customPayload?: Partial<LogInAsJwtPayload>): Promise<JwtToken> {
    try {
      const { accessSecret, refreshSecret, accessExpiration, refreshExpiration } = this.configService.get('jwt');
      const sessionId = uuidv4();
      const payload: Partial<LogInAsJwtPayload> = {
        id: user.id,
        role: user.role,
        email: user.email,
        permission: user.permission,
        ...customPayload
      };

      const accessTokenDto = new TokenDto(
        user,
        ETokenType.ACCESS,
        Number(accessExpiration),
        this.jwtService.sign(payload, { secret: accessSecret }),
        sessionId
      );
      const refreshTokenDto = new TokenDto(
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
      this.logger.error(`TokenService create => ${err.message}`, err.stack);
    }
  }

  async findTokenAndCheckIfExpire(token: string): Promise<Token> {
    try {
      const tokenDoc = await this.tokenRepository.findOne({ where: { token }, relations: ['user'] });

      if (!tokenDoc) {
        throw new UnauthorizedException('Invalid credentials');
      }
      // TODO: include date check in db-config.ts query
      TokenService.isExpired(tokenDoc.expirationTime);
      return tokenDoc;
    }
    catch (err) {
      console.log('TokenService, findTokenAndCheckIfExpire =>', err);
      this.logger.error(`TokenService findTokenAndCheckIfExpire => token Value ${token}, ${err.message}`, err.stack);
    }
  }

  private static isExpired(expirationTime: Date): void {
    const now = new Date();
    if (expirationTime.getTime() < now.getTime()) {
      throw new UnauthorizedException('Session is expired');
    }
  }

  async update(oldRefreshToken: string, customPayload: Partial<LogInAsJwtPayload>): Promise<JwtToken> {
    try {
      const { accessSecret, refreshSecret, accessExpiration, refreshExpiration } = this.configService.get('jwt');
      const refreshTokenDoc = await this.findTokenAndCheckIfExpire(oldRefreshToken);

      let accessTokenDoc = await this.tokenRepository.findOneBy({
        sessionId: refreshTokenDoc.sessionId,
        tokenType: ETokenType.ACCESS
      });

      if (!accessTokenDoc) {
        const accessDto = new TokenDto(
          refreshTokenDoc.user,
          ETokenType.ACCESS,
          Number(accessExpiration),
          this.jwtService.sign(customPayload, { secret: accessSecret }),
          refreshTokenDoc.sessionId
        );

        accessTokenDoc = this.tokenRepository.create(accessDto);
      }

      const now = new Date();
      refreshTokenDoc.token = this.jwtService.sign(customPayload, { secret: refreshSecret });
      refreshTokenDoc.expirationTime = addSeconds(now, refreshExpiration);

      accessTokenDoc.token = this.jwtService.sign(customPayload, { secret: accessSecret });
      accessTokenDoc.expirationTime = addSeconds(now, accessExpiration);

      await this.tokenRepository.saveTokens(accessTokenDoc, refreshTokenDoc);
      return { accessToken: accessTokenDoc.token, refreshToken: refreshTokenDoc.token };
    } catch (err) {
      console.log('TokenService, Updation =>', err);
      this.logger.error(`TokenService Updation => ${err.message}`, err.stack);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async deleteExpiredTokens(): Promise<void> {
    const expiredForWeek = new Date(new Date().getTime() - DayInMilliseconds);
    const tokens = await this.tokenRepository.findBy({ expirationTime: LessThan(expiredForWeek) });
    await this.tokenRepository.remove(tokens);
  }

  async removeTokensOnLogout(refreshToken: string): Promise<void> {
    await this.tokenRepository.removeTokens(refreshToken);
  }

  async removeOtherTokensOnLogin(sessionId: string, userId: string): Promise<any> {
    return this.tokenRepository.removeOtherTokens(sessionId, userId);
  }
}
