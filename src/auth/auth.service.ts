

import { UsersService } from './../users/users.service';
import * as bcrypt from 'bcryptjs';
import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Credentials } from './dtos/auth-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from './entities/account.entity';
import { TokenService } from './services/token.service';
import { UserDto } from 'src/users/dto/User.dto';
import { UserLogin } from './user-login';
import { JwtPayload } from './jwt.strategy';
import { User } from 'src/users/entities/user.entity';


@Injectable()
export class AuthService {

constructor(@InjectRepository(Account)
private accountsRepository: Repository<Account>,private userService:UsersService, private jwtService: JwtService, private readonly tokenService: TokenService){}

// async validateUser(username: string, password: string): Promise<any> {
//   // First, try to find the user in the user repository
//   const user = await this.userService.findOne(username);
//   console.log("Hi! i am validateUser method in auth service : ",user);
//   if (user && await bcrypt.compare(password, user.password)) {
//     const { password, ...result } = user;

//     console.log("Hi! printing result array in validateuser(auth service) : ",result);

//      return result
//   }


//   console.log("user verfification fialed ")
//   // If neither user nor admin is found
//   return null;
// }

//   async login(user: any) {
   
//     return {
//       access_token: await this.generateAccessToken(user),
//       refresh_token:await this.generateRefreshToken(user)
//     };
//   }

async login({ email, password }: Credentials): Promise<UserLogin> {
  
  const user = await this.userService.findOne(email);

  // if (!user?.account?.password) {
  //   throw new ForbiddenException("Invalid credentials. Try to reset password");
  // }

  user.account.failedLoginAttempts = 0;
  user.account.blockedUntil = null;
  user.account.lastFailedLogin = null;

  // TODO: get user permission from permission table on the basis of user role & id
  //user.permission = {hoList: ['bb2737cf-7219-4534-a2d5-4947e8dfd2d1']};

  await this.accountsRepository.save(user.account, { data: user });

  console.log({ message: `Logging user ${email}` });
  const tokens = await this.tokenService.create(user);

  await this.tokenService.removeOtherTokensOnLogin(tokens.sessionId, user.id);


  delete tokens.sessionId;

  return { ...tokens, user: UserDto.fromEntity(user) };
}

async validateUser(payload: Partial<JwtPayload>): Promise<User> {
  const user = await this.userService.findOne(payload.id);
  if (!user) {
    throw new UnauthorizedException("Invalid token");
  }
  if (user.role !== payload.role) {
    throw new UnauthorizedException({  message: "Your role has been changed" });
  }
  
  return user;
}
  

//   async generateAccessToken(user:any)
//   {
//     const payload = { username: user.username, sub: user.userId };
//     return  this.jwtService.sign(payload,{ expiresIn: '60s' });
//   }

//   async generateRefreshToken(user:any)
//   {
//     const payload = { username: user.username, sub: user.userId};
//     return  this.jwtService.sign(payload,{ expiresIn: '7d' });
//     }

//     async validateRefreshToken(token: string): Promise<any> {
//       try {
//         const payload = this.jwtService.verify(token);
//         const user = await this.userService.findOne(payload.username);
//         console.log("Hi! i am validateRefreshToken(auth service) : ",user);
//         if (user) {
//           return { ...user, token };
//         }
//       } catch (error) {
//         return null;
//       }
//     }
  }




