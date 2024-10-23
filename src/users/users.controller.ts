import { Controller, Get, Post, Body, Patch, Param, Delete , UseGuards, Req, Request} from '@nestjs/common';
import { UsersService } from './users.service';
// import { Request } from "express";
import { User } from './entities/user.entity';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { ERole } from './enums/roles.enum';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { Public } from 'src/auth/decorators/public.decorator';

@UseGuards(JwtAuthGuard)
@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}


  @Public()
  @Post('signup')
  async signUp(@Body() createUserDto:CreateUserDto,@Request() req)
  {
     return this.usersService.createUser(createUserDto);
  }


@Get('profile')
@UseGuards(RolesGuard)
@Roles(ERole.ADMIN)
getProfile(@Request() req):User
{
     return req.user;
}





}