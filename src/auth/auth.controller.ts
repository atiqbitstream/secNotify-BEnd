import { UsersService } from 'src/users/users.service';
import { Body, Controller, Post, Req,Headers, Res, UseGuards, HttpException, HttpStatus } from "@nestjs/common";
import { AuthService } from "./services/auth.service";
 import { Request  } from '@nestjs/common';
 import { response, Response } from 'express';

import { CreateUserDto } from "src/users/dto/create-user.dto";
import { TokenService } from './services/token.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { HttpService } from '@nestjs/axios';


@Controller('auth')
export class AuthController {
  constructor( private authService:AuthService,private userService:UsersService, private tokenService:TokenService) {}


  @Post('login')
  async login(@Body() createUserDto: CreateUserDto, @Req() { }: Request) {

    return  this.authService.login(createUserDto);

  }


  @UseGuards(JwtAuthGuard)
  @Post('verifyToken')
  async verifyToken(@Headers('Authorization') authorization:string)
  {
    if(!authorization)
    {
      throw new HttpException('Authorization header missing', HttpStatus.BAD_REQUEST)
    }

    const token=authorization.split(' ')[1];

    if(!token)
    {
      throw new HttpException('Invalid token format', HttpStatus.BAD_REQUEST);
    }

    try{
      const decodedToken = await this.tokenService.verifyToken(token);
      return decodedToken;
    }
    catch(error)
    {
      throw new HttpException('Token verification failed', HttpStatus.UNAUTHORIZED)
    }
  }




}
