import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(username: string, password: string): Promise<any> {
    console.log("hi i am local auth vlaidate param vlaues", username, password)
    const user = await this.authService.validateUser(username, password);

    console.log("Hi! i am printing user from local strategy(validate func) : ",user)
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}