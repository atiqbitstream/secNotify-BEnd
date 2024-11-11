import { UsersService } from 'src/users/users.service';
import { Body, Controller, Post, Req, Res, UseGuards } from "@nestjs/common";
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
  async verifyToken()
  {
    return this.tokenService.verifyToken();
  }




}
