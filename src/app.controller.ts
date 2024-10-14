import { Controller, Get,Request, Post, UseGuards, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthService } from './auth/auth.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { LocalAuthGuard } from './auth/local-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { ERole } from './users/enums/roles.enum';
import { Roles } from './auth/decorators/roles.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private authService:AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard,RolesGuard)
  @Roles(ERole.ADMIN)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @Post('refresh')
  async refreshToken(@Body('refresh_token') refresh_token: string) {
    const validUser = await this.authService.validateRefreshToken(refresh_token);
    if (!validUser) {
      return { statusCode: 401, message: 'Invalid refresh token' };
    }
    return {
      access_token:await this.authService.generateAccessToken(validUser),
    };
  }
}
