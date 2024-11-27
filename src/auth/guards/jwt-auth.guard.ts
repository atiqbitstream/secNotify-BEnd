import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { TokenService } from '../services/token.service';
import { Reflector } from '@nestjs/core';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') implements CanActivate {
  constructor(
    private readonly tokenService: TokenService,
    private reflector: Reflector,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.get<boolean>(
      'isPublic',
      context.getHandler(),
    );
    if (isPublic) {
      return true; // Allow public access
    }

    const request: Request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('No token Provided');
    }

    try {
      const tokenDocument = await this.validateToken(token);

      request.user = tokenDocument.user;

      return true;
    } catch (error) {
      this.handleAuthenticationError(error);
    }
  }
  private extractTokenFromHeader(request: Request): string | null {
    const authHeader = request.headers.authorization;
    if (!authHeader) return null;

    const [bearer, token] = authHeader.split(' ');
    return bearer === 'Bearer' ? token : null;
  }

  private async validateToken(token: string) {
    try {
      return await this.tokenService.findTokenAndCheckIfExpire(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private handleAuthenticationError(error: any) {
    console.error('Authentication Error : ', {
      message: error.message,
      stack: error.stack,
    });

    if (error instanceof UnauthorizedException) {
      throw error;
    }

    throw new UnauthorizedException('Authentication Failed');
  }
}
