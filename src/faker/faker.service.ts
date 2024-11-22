import { Injectable } from '@nestjs/common';
import { Account } from 'src/auth/entities/account.entity';
import { User } from 'src/users/entities/user.entity';
import { ERole } from 'src/users/enums/roles.enum';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class FakerService {
  constructor(private usersService: UsersService) {}

  private createdUsers: User[] = []; // Array to store created users

  async setUpForDemo() {
    const FAdmin = await this.usersService.createUser({
      username: 'wazi',
      firstName: 'Waseem',
      lastName: 'khan',
      password: 'Ab3!qz',
      email: 'wazi@gmail.com',
      role: ERole.ADMIN,
      organizationId: '123',
      organization: 'emanDairy',

    });

    const FUser = await this.usersService.createUser({
      username: 'atiqo',
      firstName: 'Atiq',
      lastName: 'khan',
      password: 'M7x@rd',
      email: 'atiq@gmail.com',
      role: ERole.USER,
      organizationId: '123',
      organization: 'emanDairy',

    });

    const FRider = await this.usersService.createUser({
      username: 'user01',
      firstName: 'User',
      lastName: 'khan',
      password: 'Zt2$hp',
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


  //this function delete all the users created above
  // async deleteDemoUsers() {
  //   try {
  //     for (const user of this.createdUsers) {
  //       await this.usersService.deleteUserById(user.id);
  //       console.log(`Deleted user with ID: ${user.id}`);
  //     }
  //     // Clear the array after deletion to avoid repeat deletions
  //     this.createdUsers = [];
  //   } catch (error) {
  //     console.error('Error deleting demo users:', error);
  //   }
  // }
}
