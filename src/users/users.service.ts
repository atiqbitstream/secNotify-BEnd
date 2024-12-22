import { CurrentUser } from './../auth/decorators/current-user.decorator';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Not, Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Account } from 'src/auth/entities/account.entity';
import { generateResetPasswordToken, generateResetPasswordTokenExpirationDate } from 'src/utils/rest-password-helper';
import { error } from 'console';
import { Token } from 'src/auth/entities/token.entity';
import { ERole } from './enums/roles.enum';


@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Token)
    private tokensRepository: Repository<Token>,
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

    if (!newUser.password || typeof newUser.password !== 'string') {
      throw new Error('Password must be a valid string');
  }
  
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

  async logoutUser(currentUser:User)
  {

   try
   {
    const targetUser = await this.usersRepository.findOne({
      where: { id: currentUser.id},
      relations: ['tokens'], 
    });

    if (!currentUser) {
      throw new Error('User not found');
    }
    const tokensToRemove = targetUser.tokens;

    console.log("tokens to be removed =>",tokensToRemove)

    if(tokensToRemove.length===0)
    {
      throw new error("no tokens to remove")
    }

    for(const token of tokensToRemove)
    {
      const tokenRemove=await this.tokensRepository.findOneBy({id:token.id})
      if(tokenRemove)
      {
        await this.tokensRepository.remove(tokenRemove);
      }
    }
   }
   catch(error)
   {
    console.error('error during logout : ', error);
   }
  }

  getRider(riderId,organizationId) {
   
    if(!riderId || !organizationId)
    {
      throw new error('customerId and organizationId are required !')
    }

    const rider = this.usersRepository.findOne({
      where:{
        id:riderId,
        organizationId:organizationId,
        role:ERole.RIDER
      }
    })

    if(!rider)
    {
      throw new NotFoundException(`Rider with id ${riderId} does not belong to organizationId ${organizationId}`)
    }

  
    return rider;
  }

  async findAll(organizationId:number):Promise<User[]>
  {
    if(!organizationId)
    {
      throw new NotFoundException('Organization Not found')
    }

    const riders =await this.usersRepository.find({
      where:{
        organizationId:organizationId,
        role:ERole.RIDER
       
      }
    })

    if(riders.length===0)
    {
      throw new NotFoundException(`No riders were found for organization ID ${organizationId}`)
    }

    return riders;
  }

  async update(id:number, organizationId:number, updateRider:UpdateUserDto):Promise<User>
  {
     if(!id)
     {
      throw new BadRequestException('Rider Id not found');
     }

     try{
      const existingRider = await this.usersRepository.findOne({
        where:{
          id:id,
          organizationId:organizationId
        }
      })

      if(!existingRider)
      {
        throw new NotFoundException(
          `Rider with id ${id} and organizationId ${organizationId} not found`
        );
      }

      const updatedCustomer = await this.usersRepository.merge(existingRider,updateRider);

      const savedCustomer = await this.usersRepository.save(updatedCustomer);

      return savedCustomer;
     }catch(error)
     {
      console.log(error);
     }
  }

  async remove(id:number, organizationId:number)
  {
    if(!id || !organizationId)
    {
      throw new NotFoundException(`Rider with id ${id} is null and organization with id ${organizationId} is null`)
    }

    const rider = await this.usersRepository.findOne({
      where :{
        id,
        organizationId
      }
    })

    if(!rider)
    {
      throw new NotFoundException('Rider not found and does not exist');
    }

    rider.isDeleted=true;

    await this.usersRepository.save(rider);
  }

  //this function is just for faker service to delete all created users
  
  // async deleteUserById(userId: number): Promise<void> {
  //   const user = await this.usersRepository.findOne({ where: { id: userId } });
  //   if (!user) {
  //     throw new Error('User not found');
  //   }
  //   await this.usersRepository.remove(user);
  // }
  
}
