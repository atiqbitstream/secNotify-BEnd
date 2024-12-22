
import { ERole } from '../enums/roles.enum';

import { User } from '../entities/user.entity';
import { IsArray, IsOptional } from 'class-validator';

export class UserDto {

  id: number;


  firstName: string;


  lastName: string;


  email: string;


  phoneNumber: string;




  role: ERole;




  organizationId?: number;

  organization:string

  static fromEntity(user: User) {
    const userDto = new UserDto();

    userDto.id = user.id;
    userDto.firstName = user.firstName;
    userDto.lastName = user.lastName;
    userDto.email = user.email;
    userDto.role = user.role;
  
    userDto.organizationId = user.organizationId;
    userDto.organization=user.organization;


    return userDto;
  }
}
