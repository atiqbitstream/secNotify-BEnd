
import { UsersService } from './../users/users.service';
import * as bcrypt from 'bcryptjs';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { permission } from 'process';
import { CreateUserDto } from 'src/users/dto/create-user.dto';


@Injectable()
export class AuthService {

constructor(private userService:UsersService, private jwtService: JwtService){}

async validateUser(username: string, password: string): Promise<any> {
  // First, try to find the user in the user repository
  const user = await this.userService.findOne(username);
  console.log("Hi! i am validateUser method in auth service : ",user);
  if (user && await bcrypt.compare(password, user.password)) {
    const { password, ...result } = user;

    console.log("Hi! printing result array in validateuser(auth service) : ",result);

     return result
  }


  console.log("user verfification fialed ")
  // If neither user nor admin is found
  return null;
}

  async login(user: any) {
   
    return {
      access_token: await this.generateAccessToken(user),
      refresh_token:await this.generateRefreshToken(user)
    };
  }

  async generateAccessToken(user:any)
  {
    const payload = { username: user.username, sub: user.userId };
    return  this.jwtService.sign(payload,{ expiresIn: '60s' });
  }

  async generateRefreshToken(user:any)
  {
    const payload = { username: user.username, sub: user.userId};
    return  this.jwtService.sign(payload,{ expiresIn: '7d' });
    }

    async validateRefreshToken(token: string): Promise<any> {
      try {
        const payload = this.jwtService.verify(token);
        const user = await this.userService.findOne(payload.username);
        console.log("Hi! i am validateRefreshToken(auth service) : ",user);
        if (user) {
          return { ...user, token };
        }
      } catch (error) {
        return null;
      }
    }
  }


