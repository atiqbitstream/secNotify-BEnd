import { Test } from '@nestjs/testing';
import { EmailSesService } from '../../../system-notification/email-ses/email-ses.service';
import { UsersService } from '../users.service';
import { MockedDataSource, UserRepositoryMock } from './mocks/user.model';
import { MockedEmailSesService } from '../../../system-notification/email-ses/tests/mocks/email-ses.model';
import { ERole } from '../../../enums/role.enum';
import { EUserStatus } from '../../../enums/user-status.enum';
import { EUSTimezones } from '../../../enums/timezones.enum';
import { UserConfig } from '../../../interfaces/user-config';
import * as resetPasswordHelper from '../../../utils/reset-password';
import { UpdatePersonalInfoDto } from '../dto/update-personal-info.dto';
import { DONT_HAVE_PERMISSIONS } from '../../../utils/error-messages';
import { userStub } from '../../health-organizations/tests/stubs/user.stub';
import { ConfigService } from '@nestjs/config';
import { superAdminStub, tcAdminStub } from './stubs/user.stub';
import { UserRepository } from '../users.repository';
import { UpdateUserDto } from '../dto/update-user.dto';
import { User } from '../entities/user.entity';
import { UserDto } from '../dto/user.dto';
import { AuditService } from '../../audit/audit.service';
import { MockedAuditService } from '../../audit/tests/mocks/audit.model';
import { DataSource } from 'typeorm';

jest.mock('typeorm', () => ({
  ...jest.requireActual('typeorm'),
  getRepository: jest.fn().mockResolvedValue(() => ({
    findOneBy: jest.fn().mockImplementation((obj) => obj)
  }))
}));

describe('UsersService', () => {
  let usersService: UsersService;
  let emailService: EmailSesService;

  class configServiceMock {
    static get = jest.fn().mockReturnValue({ refreshSecret: 'secret' });
  }

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: EmailSesService,
          useValue: MockedEmailSesService
        },
        {
          provide: ConfigService,
          useValue: configServiceMock
        },
        {
          provide: UserRepository,
          useValue: UserRepositoryMock
        },
        {
          provide: AuditService,
          useValue: MockedAuditService
        },
        {
          provide: DataSource,
          useValue: MockedDataSource
        }
      ]
    }).compile();
    usersService = module.get<UsersService>(UsersService);
    emailService = module.get<EmailSesService>(EmailSesService);
  });

  afterEach(jest.clearAllMocks);

  describe('findOneByEmail', () => {
    it('should return user by email', async () => {
      jest.spyOn(UserRepositoryMock, 'findByEmail').mockResolvedValueOnce(userStub());
      const user = await usersService.findOneByEmail(userStub().email);
      expect(user).toEqual(userStub());
    });
  });

  describe('findById', () => {
    it('should return user by email', async () => {
      jest.spyOn(UserRepositoryMock, 'findOne').mockResolvedValueOnce(userStub());
      const user = await usersService.findById(userStub().id);
      expect(user).toEqual(userStub());
    });
  });

  describe('findActiveByEmail', () => {
    it('should return new user', async () => {
      jest.spyOn(UserRepositoryMock, 'findActiveByEmail').mockResolvedValueOnce(userStub());
      const newUser = await usersService.findActiveByEmail(userStub().email);
      expect(newUser).toEqual(userStub());
    });
  });

  describe('update', () => {
    const userDto: UpdatePersonalInfoDto = {
      firstName: 'John',
      lastName: 'Doe',
      jobTitle: 'employee',
      phoneNumber: '1234567890',
      preferredTimezone: EUSTimezones.CST
    };

    describe('when cannot find user to update', () => {
      beforeEach(async () => {
        jest.spyOn(UserRepositoryMock, 'findOne').mockResolvedValueOnce(undefined);
      });

      it('should throw an error', async () => {
        await expect(usersService.updateMyPersonalInfo(userDto, userStub())).rejects.toThrow();
      });
    });

    describe('when user logged through ViewDashboard', () => {
      const currentUser: User = { ...userStub() };
      currentUser['onBehalfOfRoleId'] = 'id';
      it('should throw an error', async () => {
        const findUserSpy = jest.spyOn(UserRepositoryMock, 'findOne');
        await expect(usersService.updateMyPersonalInfo(userDto, currentUser)).rejects.toThrow();
        expect(findUserSpy).not.toHaveBeenCalled();
      });
    });

    describe('when updating user', () => {
      it('should return updated user', async () => {
        jest.spyOn(UserRepositoryMock, 'findOne').mockResolvedValueOnce(userStub());
        const res = await usersService.updateMyPersonalInfo(userDto, userStub());
        const expected = UserDto.fromEntity({ ...userStub(), ...userDto });
        expect(res).toEqual(expected);
      });
    });
  });

  describe('updateUserStatus', () => {
    describe('when update user`s status', () => {
      beforeEach(() => {
        jest.spyOn(UserRepositoryMock, 'findUserOrFail').mockResolvedValueOnce(userStub());
        jest.spyOn(UserRepositoryMock, 'count').mockResolvedValueOnce(userStub());
        jest.spyOn(UserRepositoryMock, 'save').mockImplementationOnce(async (user) => user);
      });
      it('should set new status to user', async () => {
        const res = await usersService.updateUserStatus(userStub().id, EUserStatus.DISABLED, userStub());
        expect(res.status).toEqual(EUserStatus.DISABLED);
      });
    });
  });

  describe('updateById', () => {
    const updateUserDto: UpdateUserDto = {
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      jobTitle: 'employee',
      phoneNumber: '1234567890'
    };

    describe('when updating email of invited user', () => {
      const invitedUser: User = {
        ...userStub(),
        status: EUserStatus.INVITED,
        email: `test${userStub().email}`
      };
      beforeEach(() => {
        jest.spyOn(UserRepositoryMock, 'findUserOrFail').mockResolvedValueOnce(invitedUser);
      });
      it('should return updated user', async () => {
        const user = await usersService.updateById(invitedUser.id, updateUserDto, userStub());
        expect(user).toEqual(UserDto.fromEntity({ ...invitedUser, ...updateUserDto }));
        expect(emailService.createAccount).toBeCalledTimes(1);
      });
    });

    describe('when updating email of active user', () => {
      const userToUpdate: User = {
        ...userStub(),
        role: ERole.TC_ADMIN,
        status: EUserStatus.ACTIVE,
        email: `test${userStub().email}`
      };

      beforeEach(() => {
        jest.spyOn(UserRepositoryMock, 'findUserOrFail').mockResolvedValueOnce(userToUpdate);
      });
      it('should return updated user', async () => {
        const user = await usersService.updateById(userToUpdate.id, updateUserDto, userStub());
        expect(user).toEqual(UserDto.fromEntity({ ...userToUpdate, ...updateUserDto }));
      });
    });
  });

  describe('createDerivativeUser', () => {
    // const userDto: CreateUserDto = userDtoStub();
    // beforeAll(async () => {
    //   jest.spyOn(UserRepositoryMock, 'findOne').mockResolvedValueOnce(null);
    //   jest.spyOn(UserRepositoryMock, 'create').mockImplementationOnce((user) => user);
    // });
    // it('should return a message about sent invitation', async () => {
    //   const initUserSpy = jest.spyOn(usersService, 'initializeUniqueUser');
    //   const saveUserSpy = jest.spyOn(usersService, 'createUser');
    //   const result = await usersService.createDerivativeUser(userDto, hoAdminStub());
    //   expect(result).toEqual({ message: 'The invitation has been sent' });
    //   expect(initUserSpy).toBeCalledTimes(1);
    //   expect(saveUserSpy).toBeCalledTimes(1);
    //   expect(emailService.createAccount).toBeCalledTimes(1);
    // });
  });

  describe('findAll', () => {
    it('should call find users method', async () => {
      const findUsersSpy = jest.spyOn(UserRepositoryMock, 'findPaginatedUsers');
      await usersService.findAll({ value: userStub().email }, userStub());
      expect(findUsersSpy).toHaveBeenCalledWith({ value: userStub().email }, userStub());
    });
  });

  describe('initOrganizationUser', () => {
    const userData: UpdateUserDto = {
      email: 'email@example.com',
      firstName: 'Sam',
      lastName: 'Johnson',
      jobTitle: 'driver',
      phoneNumber: '1234567890'
    };
    const additionalProps: UserConfig = { organizationId: 'id', role: ERole.HO_EMPLOYEE, isTest: false };
    const account = { resetPasswordToken: 'token', resetPasswordExpires: new Date('2021-06-24T11:29:36.226Z') };

    let resetPasswordSpy, resetPasswordExpiresSpy;
    beforeAll(() => {
      resetPasswordSpy = jest
        .spyOn(resetPasswordHelper, 'generateResetPasswordToken')
        .mockReturnValueOnce(account.resetPasswordToken);
      resetPasswordExpiresSpy = jest
        .spyOn(resetPasswordHelper, 'generateResetPasswordTokenExpirationDate')
        .mockReturnValueOnce(account.resetPasswordExpires);
      jest.spyOn(UserRepositoryMock, 'findOne').mockResolvedValueOnce(null);
      jest.spyOn(UserRepositoryMock, 'create').mockImplementationOnce((user) => user);
    });
    // it('should return a user', async () => {
    //   const user = await usersService.initializeUniqueUser(userData, additionalProps);
    //   expect(user).toEqual({ ...userData, ...additionalProps, account });
    //   expect(resetPasswordSpy).toBeCalledTimes(1);
    //   expect(resetPasswordExpiresSpy).toBeCalledTimes(1);
    // });
  });

  describe('getAllOrganizationUsers', () => {
    let admin: User;
    beforeEach(() => {
      admin = superAdminStub();
      jest.spyOn(UserRepositoryMock, 'find').mockResolvedValueOnce([userStub()]);
    });
    it('should return array of users in organization', async () => {
      expect(await usersService.getAllOrganizationUsers('id', admin)).toEqual([UserDto.fromEntity(userStub())]);
    });
  });

  describe('getOrganizationAdmin', () => {
    describe('when user was found', () => {
      beforeEach(() => {
        jest.spyOn(UserRepositoryMock, 'findOne').mockResolvedValueOnce(tcAdminStub());
        jest.spyOn(MockedDataSource, 'getRepository').mockResolvedValueOnce(tcAdminStub());
      });

      it('should return user', async () => {
        expect(await usersService.getOrganizationAdmin('org')).toEqual(tcAdminStub());
      });
    });

    describe.skip('when user not found', () => {
      beforeEach(() => {
        jest.spyOn(UserRepositoryMock, 'findOne').mockResolvedValueOnce(null);
        jest.spyOn(MockedDataSource, 'getRepository').mockImplementation();
        jest.spyOn(MockedDataSource, 'findOneBy').mockImplementation();
      });

      it('should return an error', async () => {
        await expect(usersService.getOrganizationAdmin(userStub().organizationId)).rejects.toThrow(
          'You cannot get this user'
        );
      });
    });

    describe.skip('when find inactive user', () => {
      beforeEach(() => {
        const user = { ...userStub(), status: EUserStatus.DISABLED };
        jest.spyOn(UserRepositoryMock, 'findOne').mockResolvedValueOnce(user);
        jest.spyOn(MockedDataSource, 'getRepository').mockResolvedValueOnce(() => 'findOneBy');
      });

      it('should return an error', async () => {
        await expect(usersService.getOrganizationAdmin(userStub().organizationId)).rejects.toThrow('Admin not found');
      });
    });
  });

  describe('getActiveSuperAdmins', () => {
    let findUsersSpy;
    beforeEach(() => {
      findUsersSpy = jest.spyOn(UserRepositoryMock, 'findBy').mockResolvedValueOnce([superAdminStub()]);
    });
    it('should return active user with SUPER_ADMIN role', async () => {
      const users = await usersService.getActiveSuperAdmins(false);
      expect(users).toEqual([superAdminStub()]);
      const expectedQuery = { role: ERole.SUPER_ADMIN, status: EUserStatus.ACTIVE, isTest: superAdminStub().isTest };
      expect(findUsersSpy).toHaveBeenCalledWith(expectedQuery);
    });
  });

  describe('validatePassword', () => {
    describe('when password is valid', () => {
      beforeEach(() => {
        jest.spyOn(resetPasswordHelper, 'isSamePassword').mockResolvedValueOnce(true);
      });

      it('should resolve', async () => {
        await usersService.validatePassword('pass', 'hashedPass');
      });
    });

    describe('when password not valid', () => {
      beforeEach(async () => {
        jest.spyOn(resetPasswordHelper, 'isSamePassword').mockResolvedValueOnce(false);
      });

      it('should throw an error', async () => {
        await expect(usersService.validatePassword('pass', 'hashedPass')).rejects.toThrow('Password is invalid.');
      });
    });
  });

  describe('restrictDashboardUser', () => {
    describe('when user(Super Admin) acts from View Dahsboard', () => {
      const user: User = userStub();
      user['onBehalfOfRoleId'] = 'id';

      it('should throw an error', () => {
        expect(() => usersService.restrictDashboardUser(user)).toThrow(DONT_HAVE_PERMISSIONS);
      });
    });
  });
});
