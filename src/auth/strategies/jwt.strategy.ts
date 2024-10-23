import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config'; // Import ConfigService
import { AuthService } from '../services/auth.service';
import { User } from '../../users/entities/user.entity';
import { ERole } from 'src/users/enums/roles.enum';

export interface JwtPayload {
  id: string;
  role: ERole;
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private authService: AuthService,
    private readonly configService: ConfigService // Ensure correct injection syntax
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true,
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET'),  // Correct configService usage
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    return this.authService.validateUser(payload);
  }
}
