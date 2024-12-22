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
    // Organization 1: emaanDairy
    const Admin1 = await this.usersService.createUser({
      username: 'adminEmaan',
      firstName: 'Admin',
      lastName: 'Emaan',
      phoneNumber: '0300456789',
      address: 'HQ Emaan Dairy',
      sector: 'G-11',
      street: 'Main Street',
      cnicNumber: '61101-1111111-1',
      password: 'Admin@Emaan1',
      email: 'admin@emaandairy.com',
      role: ERole.ADMIN,
      organizationId: 1,
      organization: 'emaanDairy',
      isTest: false
    });

    const UsersEmaan = await Promise.all([
      this.usersService.createUser({
        username: 'userEmaan1',
        firstName: 'User1',
        lastName: 'Emaan',
        phoneNumber: '0312123456',
        address: 'Sector A',
        sector: 'I-10',
        street: 'Street 1',
        cnicNumber: '61101-2222222-2',
        password: 'User@Emaan1',
        email: 'user1@emaandairy.com',
        role: ERole.USER,
        organizationId: 1,
        organization: 'emaanDairy',
        isTest: false
      }),
      this.usersService.createUser({
        username: 'userEmaan2',
        firstName: 'User2',
        lastName: 'Emaan',
        phoneNumber: '0321987654',
        address: 'Sector B',
        sector: 'G-9',
        street: 'Street 2',
        cnicNumber: '61101-3333333-3',
        password: 'User@Emaan2',
        email: 'user2@emaandairy.com',
        role: ERole.USER,
        organizationId: 1,
        organization: 'emaanDairy',
        isTest: false
      }),
      this.usersService.createUser({
        username: 'userEmaan3',
        firstName: 'User3',
        lastName: 'Emaan',
        phoneNumber: '0333123456',
        address: 'Sector C',
        sector: 'G-8',
        street: 'Street 3',
        cnicNumber: '61101-4444444-4',
        password: 'User@Emaan3',
        email: 'user3@emaandairy.com',
        role: ERole.USER,
        organizationId: 1,
        organization: 'emaanDairy',
        isTest: false
      })
    ]);

    const RidersEmaan = await Promise.all([
      this.usersService.createUser({
        username: 'riderEmaan1',
        firstName: 'Rider1',
        lastName: 'Emaan',
        phoneNumber: '0345123456',
        address: 'Sector D',
        sector: 'F-10',
        street: 'Street 4',
        cnicNumber: '61101-5555555-5',
        password: 'Rider@Emaan1',
        email: 'rider1@emaandairy.com',
        role: ERole.RIDER,
        organizationId: 1,
        organization: 'emaanDairy',
        isTest: false
      }),
      this.usersService.createUser({
        username: 'riderEmaan2',
        firstName: 'Rider2',
        lastName: 'Emaan',
        phoneNumber: '0355123456',
        address: 'Sector E',
        sector: 'H-9',
        street: 'Street 5',
        cnicNumber: '61101-6666666-6',
        password: 'Rider@Emaan2',
        email: 'rider2@emaandairy.com',
        role: ERole.RIDER,
        organizationId: 1,
        organization: 'emaanDairy',
        isTest: false
      }),
      this.usersService.createUser({
        username: 'riderEmaan3',
        firstName: 'Rider3',
        lastName: 'Emaan',
        phoneNumber: '0366123456',
        address: 'Sector F',
        sector: 'I-8',
        street: 'Street 6',
        cnicNumber: '61101-7777777-7',
        password: 'Rider@Emaan3',
        email: 'rider3@emaandairy.com',
        role: ERole.RIDER,
        organizationId: 1,
        organization: 'emaanDairy',
        isTest: false
      })
    ]);

    // Organization 2: newDairy
    const Admin2 = await this.usersService.createUser({
      username: 'adminNew',
      firstName: 'Admin',
      lastName: 'New',
      phoneNumber: '0301456789',
      address: 'HQ New Dairy',
      sector: 'H-11',
      street: 'Main Street',
      cnicNumber: '61102-1111111-1',
      password: 'Admin@New1',
      email: 'admin@newdairy.com',
      role: ERole.ADMIN,
      organizationId: 2,
      organization: 'newDairy',
      isTest: false
    });

    const UsersNew = await Promise.all([
      this.usersService.createUser({
        username: 'userNew1',
        firstName: 'User1',
        lastName: 'New',
        phoneNumber: '0312323456',
        address: 'Sector G',
        sector: 'I-11',
        street: 'Street 7',
        cnicNumber: '61102-2222222-2',
        password: 'User@New1',
        email: 'user1@newdairy.com',
        role: ERole.USER,
        organizationId: 2,
        organization: 'newDairy',
        isTest: false
      }),
      this.usersService.createUser({
        username: 'userNew2',
        firstName: 'User2',
        lastName: 'New',
        phoneNumber: '0322887654',
        address: 'Sector H',
        sector: 'G-10',
        street: 'Street 8',
        cnicNumber: '61102-3333333-3',
        password: 'User@New2',
        email: 'user2@newdairy.com',
        role: ERole.USER,
        organizationId: 2,
        organization: 'newDairy',
        isTest: false
      }),
      this.usersService.createUser({
        username: 'userNew3',
        firstName: 'User3',
        lastName: 'New',
        phoneNumber: '0333567456',
        address: 'Sector I',
        sector: 'G-7',
        street: 'Street 9',
        cnicNumber: '61102-4444444-4',
        password: 'User@New3',
        email: 'user3@newdairy.com',
        role: ERole.USER,
        organizationId: 2,
        organization: 'newDairy',
        isTest: false
      })
    ]);

    const RidersNew = await Promise.all([
      this.usersService.createUser({
        username: 'riderNew1',
        firstName: 'Rider1',
        lastName: 'New',
        phoneNumber: '0345127456',
        address: 'Sector J',
        sector: 'G-6',
        street: 'Street 10',
        cnicNumber: '61102-5555555-5',
        password: 'Rider@New1',
        email: 'rider1@newdairy.com',
        role: ERole.RIDER,
        organizationId: 2,
        organization: 'newDairy',
        isTest: false
      }),
      this.usersService.createUser({
        username: 'riderNew2',
        firstName: 'Rider2',
        lastName: 'New',
        phoneNumber: '0355323456',
        address: 'Sector K',
        sector: 'G-5',
        street: 'Street 11',
        cnicNumber: '61102-6666666-6',
        password: 'Rider@New2',
        email: 'rider2@newdairy.com',
        role: ERole.RIDER,
        organizationId: 2,
        organization: 'newDairy',
        isTest: false
      }),
      this.usersService.createUser({
        username: 'riderNew3',
        firstName: 'Rider3',
        lastName: 'New',
        phoneNumber: '0366323456',
        address: 'Sector L',
        sector: 'G-4',
        street: 'Street 12',
        cnicNumber: '61102-7777777-7',
        password: 'Rider@New3',
        email: 'rider3@newdairy.com',
        role: ERole.RIDER,
        organizationId: 2,
        organization: 'newDairy',
        isTest: false
      })
    ]);

    // Organization 3: freshDairy
    const Admin3 = await this.usersService.createUser({
      username: 'adminFresh',
      firstName: 'Admin',
      lastName: 'Fresh',
      phoneNumber: '0302456789',
      address: 'HQ Fresh Dairy',
      sector: 'F-11',
      street: 'Main Street',
      cnicNumber: '61103-1111111-1',
      password: 'Admin@Fresh1',
      email: 'admin@freshdairy.com',
      role: ERole.ADMIN,
      organizationId: 3,
      organization: 'freshDairy',
      isTest: false
    });

    const UsersFresh = await Promise.all([
      this.usersService.createUser({
        username: 'userFresh1',
        firstName: 'User1',
        lastName: 'Fresh',
        phoneNumber: '0312423456',
        address: 'Sector M',
        sector: 'I-8',
        street: 'Street 13',
        cnicNumber: '61103-2222222-2',
        password: 'User@Fresh1',
        email: 'user1@freshdairy.com',
        role: ERole.USER,
        organizationId: 3,
        organization: 'freshDairy',
        isTest: false
      }),
      this.usersService.createUser({
        username: 'userFresh2',
        firstName: 'User2',
        lastName: 'Fresh',
        phoneNumber: '0322987654',
        address: 'Sector N',
        sector: 'H-8',
        street: 'Street 14',
        cnicNumber: '61103-3333333-3',
        password: 'User@Fresh2',
        email: 'user2@freshdairy.com',
        role: ERole.USER,
        organizationId: 3,
        organization: 'freshDairy',
        isTest: false
      }),
      this.usersService.createUser({
        username: 'userFresh3',
        firstName: 'User3',
        lastName: 'Fresh',
        phoneNumber: '0333667456',
        address: 'Sector O',
        sector: 'H-7',
        street: 'Street 15',
        cnicNumber: '61103-4444444-4',
        password: 'User@Fresh3',
        email: 'user3@freshdairy.com',
        role: ERole.USER,
        organizationId: 3,
        organization: 'freshDairy',
        isTest: false
      })
    ]);

    const RidersFresh = await Promise.all([
      this.usersService.createUser({
        username: 'riderFresh1',
        firstName: 'Rider1',
        lastName: 'Fresh',
        phoneNumber: '0345227456',
        address: 'Sector P',
        sector: 'G-3',
        street: 'Street 16',
        cnicNumber: '61103-5555555-5',
        password: 'Rider@Fresh1',
        email: 'rider1@freshdairy.com',
        role: ERole.RIDER,
        organizationId: 3,
        organization: 'freshDairy',
        isTest: false
      }),
      this.usersService.createUser({
        username: 'riderFresh2',
        firstName: 'Rider2',
        lastName: 'Fresh',
        phoneNumber: '0355523456',
        address: 'Sector Q',
        sector: 'F-7',
        street: 'Street 17',
        cnicNumber: '61103-6666666-6',
        password: 'Rider@Fresh2',
        email: 'rider2@freshdairy.com',
        role: ERole.RIDER,
        organizationId: 3,
        organization: 'freshDairy',
        isTest: false
      }),
      this.usersService.createUser({
        username: 'riderFresh3',
        firstName: 'Rider3',
        lastName: 'Fresh',
        phoneNumber: '0366523456',
        address: 'Sector R',
        sector: 'F-6',
        street: 'Street 18',
        cnicNumber: '61103-7777777-7',
        password: 'Rider@Fresh3',
        email: 'rider3@freshdairy.com',
        role: ERole.RIDER,
        organizationId: 3,
        organization: 'freshDairy',
        isTest: false
      })
    ]);

    return {
      Admin1, UsersEmaan, RidersEmaan,
      Admin2, UsersNew, RidersNew,
      Admin3, UsersFresh, RidersFresh
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
