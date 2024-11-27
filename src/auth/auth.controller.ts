import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';
import { Body, Controller, Post, Req,Headers, Res, UseGuards, HttpException, HttpStatus, Header } from "@nestjs/common";
import { AuthService } from "./services/auth.service";
 import { Request  } from '@nestjs/common';
 import { response, Response } from 'express';

import { CreateUserDto } from "src/users/dto/create-user.dto";
import { TokenService } from './services/token.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { HttpService } from '@nestjs/axios';
import { JwtService } from '@nestjs/jwt';


@Controller('auth')
export class AuthController {
  constructor( private authService:AuthService,private userService:UsersService, private tokenService:TokenService, private configService:ConfigService, private jwtService:JwtService) {}


  @Post("diagnosticToken")
  async diagnosticTokenVerification(@Headers("Authorization") authorization:string)
  {
    console.log("===== TOKEN DIAGNOSTIC ENDPOINT")

    const token = authorization.split(" ")[1];

    if(!token)
    {
      return {
        status: "ERROR",
        message: "No Token Provided",
        diagnostics:{},
      }
    }

    try {
      const accessSecret = this.configService.get("JWT_ACCESS_SECRET");

      const decoded = this.jwtService.decode(token);
      const verified = this.jwtService.verify(token, {secret: accessSecret});

      return{
        status : "SUCCESS",
        message: "Token is Valid",
        diagnostics: {
          decoded,
          verified,
          secretLength : accessSecret?.length,
          secretAvailable : !!accessSecret,
        }
      }
    }
    catch(error)
    {
        return{
          status : "ERROR",
          message: "Token Verification failed",
          diagnostics:{
            errorName : error.name,
            errorMessage: error.message
          }
        }
    }
  }

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
