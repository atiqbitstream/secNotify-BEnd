import { IsEmail } from 'class-validator';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createTokenDto } from 'src/auth/dtos/create-token.dto';
import { addSeconds } from 'src/utils/dates';
import { Token } from 'src/auth/entities/token.entity';
import { LessThan } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { TokenRepository } from '../repos/token.repository';
import { User } from '../../users/entities/user.entity';
import { ETokenType } from 'src/auth/enums/token-type.enum';
import { DayInMilliseconds } from 'src/utils/constants';
import { JwtToken } from 'src/auth/dtos/jwt-token.dto';
import { promises } from 'dns';

@Injectable()
export class TokenService {
  constructor(
    private tokenRepository: TokenRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async create(user: User): Promise<JwtToken> {
    try {
      const accessSecret = this.configService.get<string>('JWT_ACCESS_SECRET');
      const refreshSecret =
        this.configService.get<string>('JWT_REFRESH_SECRET');
      const accessExpiration = this.configService.get<number>(
        'JWT_ACCESS_EXPIRATION',
      );
      const refreshExpiration = this.configService.get<number>(
        'JWT_REFRESH_EXPIRATION',
      );

      // Check if all required secrets and expiration values are available
      if (
        !accessSecret ||
        !refreshSecret ||
        !accessExpiration ||
        !refreshExpiration
      ) {
        throw new Error(
          'JWT secrets or expiration times are not defined in the configuration.',
        );
      }
      const sessionId = uuidv4();
      const payload: Partial<User> = {
        id: user.id,
        role: user.role,
        email: user.email,
        organization:user.organization,
        organizationId:user.organizationId
      };

      const accessTokenDto = new createTokenDto(
        user,
        ETokenType.ACCESS,
        Number(accessExpiration),
        this.jwtService.sign(payload, { secret: accessSecret }),
        sessionId,
      );
      const refreshTokenDto = new createTokenDto(
        user,
        ETokenType.REFRESH,
        Number(refreshExpiration),
        this.jwtService.sign(payload, { secret: refreshSecret }),
        sessionId,
      );
      await this.tokenRepository.saveTokens(
        this.tokenRepository.create(accessTokenDto),
        this.tokenRepository.create(refreshTokenDto),
      );
      return {
        accessToken: accessTokenDto.token,
        refreshToken: refreshTokenDto.token,
        sessionId,
      };
    } catch (err) {
      console.log('TokenService, create =>', err);
      throw new InternalServerErrorException('Error generating tokens.');
    }
  }

  async findTokenAndCheckIfExpire(token: string): Promise<Token> {
    try {
      if (!token) {
        throw new UnauthorizedException('No token provided');
      }

      const tokenDoc = await this.findTokenInDataBase(token);

      this.validateTokenDoc(tokenDoc);

      return tokenDoc;
    } catch (error) {
      this.handleTokenVerificationError(error);
    }
  }

  private async findTokenInDataBase(token: string): Promise<Token> {
    try {
      const tokenDoc = await this.tokenRepository.findOne({
        where: { token },
        relations: ['user'],
      });

      if (!tokenDoc) {
        throw new UnauthorizedException('Token not found in DataBase');
      }

      return tokenDoc;
    } catch (error) {
      console.error('Database token lookup error : ', error);
      throw new UnauthorizedException('Token lookup failed');
    }
  }

  private validateTokenDoc(tokenDoc: Token): void {
    if (!tokenDoc.user) {
      throw new UnauthorizedException('No user associated with Token');
    }

    if (this.isExpired(tokenDoc.expirationTime)) {
      throw new UnauthorizedException('Token has expired');
    }
  }

  private isExpired(expirationTime: Date): boolean {
    if (!(expirationTime instanceof Date)) {
      console.error('Invalid expiration time type : ', typeof expirationTime);
      return true;
    }

    const now = new Date();
    const isExpired = expirationTime.getTime() < now.getTime();

    console.log('Token expiration Analysis : ', {
      currentTime: now,
      expirationTime: expirationTime,
      isExpired: isExpired,
    });

    return isExpired;
  }

  private handleTokenVerificationError(error: any) {
    if (error instanceof UnauthorizedException) {
      throw error;
    }

    console.error('unexpected token verification error', error);
    throw new UnauthorizedException('Token verification failed');
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

  async removeOtherTokensOnLogin(
    sessionId: string,
    userId: number,
  ): Promise<any> {
    return this.tokenRepository.removeOtherTokens(sessionId, userId);
  }

  async verifyToken(accessToken: string) {
    console.log('===== SNB Token Verification START =====');
    console.log('Input Token: ', accessToken);

    console.log(
      '[mooToYou Db jwtAuthGuard] is making request here to verify the token, I sent in headers from [JwtAuthGuard SecureNotify]',
    );

    try {
      const accessSecret = this.configService.get<string>('JWT_ACCESS_SECRET');
      console.log(
        'Access Secret Used: ',
        accessSecret ? 'Secret Available' : 'SECRET MISSING',
      );
      const decodeToken = this.jwtService.verify(accessToken, {
        secret: accessSecret,
      });

      console.log('Decoded Token Structure : ', {
        id: decodeToken.id,
        role: decodeToken.role,
        email: decodeToken.email,
        iat: decodeToken.iat,
      });

      if (!decodeToken.id || !decodeToken.role) {
        console.error('INVALID TOKEN STRUCTURE');
        return null;
      }

      console.log('===== SNB TOKEN Verification SUCCESS =====');

      return decodeToken;
    } catch (error) {
      console.error('===== SNB Token verification FAILED ===== ');
      console.error('Verification Error: ', {
        name: error.name,
        messsage: error.message,
        stack: error.stack,
      });
      return null;
    }
  }
}
