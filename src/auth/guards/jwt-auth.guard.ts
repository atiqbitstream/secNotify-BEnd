import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { TokenService } from '../services/token.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') implements CanActivate {
  constructor(private readonly tokenService: TokenService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const httpReq: Request = context.switchToHttp().getRequest();
      const token = httpReq.headers?.authorization?.split(' ')[1];
      
      if (!token) {
        throw new UnauthorizedException('Invalid credentials');
      }
      
      await this.tokenService.findTokenAndCheckIfExpire(token);

      return super.canActivate(context) as Promise<boolean>;
    } catch (error) {
      console.log('JwtAuthGuard, canActivate => ', error);
      throw new UnauthorizedException(error.message);
    }
  }
}
