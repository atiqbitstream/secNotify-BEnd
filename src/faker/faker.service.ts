import { Injectable } from '@nestjs/common';
import { ERole } from 'src/users/enums/roles.enum';
import { UsersService } from 'src/users/users.service';


@Injectable()
export class FakerService {

    constructor(private usersService:UsersService){}

     
    async setUpForDemo()
    {
  
 
    const FAdmin = await this.usersService.create({
        username : 'wazi',
        firstName : 'Waseem',
        lastName : 'khan',
        password : '123',
        email  : 'wazi@gmail.com',
        role: ERole.ADMIN,
        organizationId: '123'
    });

  

    const FUser = await this.usersService.create({
        username : 'atiqo',
        firstName : 'Atiq',
        lastName : 'khan',
        password : '123',
        email : 'atiq@gmail.com',
         role: ERole.USER,
        organizationId: '123'
    })


    const FRider = await this.usersService.create({
      username : 'user01',
      firstName : 'User',
      lastName : 'khan',
      password : '123',
      email : 'user@gmail.com',
      role: ERole.RIDER,
      organizationId: '123'
    })

 

    return {
        FAdmin,
        FUser,
        FRider
    }



    }
}