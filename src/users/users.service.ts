import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Account } from 'src/auth/entities/account.entity';
import { generateResetPasswordToken, generateResetPasswordTokenExpirationDate } from 'src/utils/rest-password-helper';


@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Account)
    private accountsRepository: Repository<Account>,
  ) {}
  
  async findOne(identifier: string): Promise<User | undefined> {
    // Attempt to find by email first, including the account relation
    const userByEmail = await this.usersRepository.findOne({
      where: { email: identifier },
      relations: ['account'],
    });
    if (userByEmail) return userByEmail;
  
    // Attempt to find by username
    const userByUsername = await this.usersRepository.findOne({
      where: { username: identifier },
      relations: ['account'],
    });
    if (userByUsername) return userByUsername;
  
  
    // Attempt to find by ID; convert identifier to a number
    const userById = await this.usersRepository.findOne({
      where: { id: Number(identifier) },
      relations: ['account'],
    });
    return userById; // Will return undefined if not found
  }
  
  

  async createUser(newUser: CreateUserDto): Promise<User> {
    const salt = await bcrypt.genSalt();
    console.log("hi I am salt here: ", salt);
    const hashedPassword = await bcrypt.hash(newUser.password, salt);
  
    // Generate the account first
    const account = this.generateAccount(newUser);
    account.password = hashedPassword; // Set the hashed password
  
    // Create the user object
    const user = this.usersRepository.create({
     ...newUser,
      account // Link the generated account
    });
  
    // Save the user, which will also save the account due to cascading
    const savedUser = await this.usersRepository.save(user);
    
    console.log("Hi, I am create method in user service: ", savedUser);
    return savedUser;
  }

      
  generateAccount(currentUser: Partial<User>): Account {
    const account = new Account();
   
    account.resetPasswordToken = generateResetPasswordToken();
    account.resetPasswordExpires =generateResetPasswordTokenExpirationDate();

    return account;

  }
}
