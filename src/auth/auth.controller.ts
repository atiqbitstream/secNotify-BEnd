import { UsersService } from 'src/users/users.service';
import { Body, Controller, Post, Req } from "@nestjs/common";
import { AuthService } from "./services/auth.service";
 import { Request  } from '@nestjs/common';
import { CreateUserDto } from "src/users/dto/create-user.dto";


@Controller('auth')
export class AuthController {
  constructor( private authService:AuthService,private userService:UsersService) {}




  @Post('login')
  async login(@Body() createUserDto: CreateUserDto, @Req() { }: Request) {
    return this.authService.login(createUserDto);
  }





}
