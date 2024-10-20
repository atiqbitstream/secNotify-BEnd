import { Injectable } from '@nestjs/common';
import { Account } from 'src/auth/entities/account.entity';
import { ERole } from 'src/users/enums/roles.enum';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class FakerService {
  constructor(private usersService: UsersService) {}

  async setUpForDemo() {
    const FAdmin = await this.usersService.createUser({
      username: 'wazi',
      firstName: 'Waseem',
      lastName: 'khan',
      password: '123',
      email: 'wazi@gmail.com',
      role: ERole.ADMIN,
      organizationId: '123',
      organization: 'emanDairy',

    });

    const FUser = await this.usersService.createUser({
      username: 'atiqo',
      firstName: 'Atiq',
      lastName: 'khan',
      password: '123',
      email: 'atiq@gmail.com',
      role: ERole.USER,
      organizationId: '123',
      organization: 'emanDairy',

    });

    const FRider = await this.usersService.createUser({
      username: 'user01',
      firstName: 'User',
      lastName: 'khan',
      password: '123',
      email: 'user@gmail.com',
      role: ERole.RIDER,
      organizationId: '123',
      organization: 'emanDairy',
      
    });

    return {
      FAdmin,
      FUser,
      FRider,
    };
  }
}
