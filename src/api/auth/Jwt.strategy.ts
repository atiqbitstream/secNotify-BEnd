import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from './services/auth.service';
import { User } from '../users/entities/user.entity';
import { ERole } from '../../enums/role.enum';

export interface JwtPayload {
  id: string;
  role: ERole;
  email: string;
  permission?: { hoList: [string] };
}

export interface LogInAsJwtPayload extends JwtPayload {
  onBehalfRole: ERole;
  organizationId: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true,
      secretOrKey: process.env.JWT_ACCESS_SECRET
    });
  }

  async validate(payload: JwtPayload & LogInAsJwtPayload): Promise<User> {
    return this.authService.validateUser(payload);
  }
}
