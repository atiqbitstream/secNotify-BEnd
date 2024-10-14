import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { InjectRepository } from '@nestjs/typeorm';


@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}
  
  async findOne(username:string):Promise<User | undefined>
  {
    return this.usersRepository.findOne({where : {username}})
  }

  async create(userDto:CreateUserDto):Promise<User>
      {
        const salt = await bcrypt.genSalt();
        console.log("hi i am salt here : ",salt)
        const hashedPassword = await bcrypt.hash(userDto.password, salt);
        const user = this.usersRepository.create({...userDto,password:hashedPassword})
        console.log("Hi, i am create method in user service : ",user);
        return this.usersRepository.save(user);
      }

}
