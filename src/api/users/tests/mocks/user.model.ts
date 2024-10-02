import { ERole } from '../../../../enums/role.enum';
import { EUserStatus } from '../../../../enums/user-status.enum';
import { EUSTimezones } from '../../../../enums/timezones.enum';
import { User } from '../../entities/user.entity';

export const userMock: User = {
  id: '',
  createdAt: new Date(),
  updatedAt: new Date(),
  email: 'example@emaill.com',
  firstName: 'first',
  lastName: 'last',
  jobTitle: 'job',
  organization: undefined,
  phoneNumber: '1234567890',
  preferredTimezone: EUSTimezones.CST,
  role: ERole.SUPER_ADMIN,
  status: EUserStatus.ACTIVE,
  isTest: false
};

export class UserRepositoryMock {
  static find = jest.fn().mockImplementation();
  static findBy = jest.fn().mockImplementation();
  static findByEmail = jest.fn().mockImplementation();
  static findOne = jest.fn().mockImplementation();
  static findOneBy = jest.fn().mockImplementation();
  static findActiveByEmail = jest.fn().mockImplementation();
  static findUserOrFail = jest.fn().mockImplementation();
  static count = jest.fn().mockImplementation();
  static save = jest.fn().mockImplementation((user) => user);
  static create = jest.fn().mockImplementation((user) => user);
  static findPaginatedUsers = jest.fn().mockImplementation((user) => user);
}

export class MockedUserService {
  static ensureUserIsUnique = jest.fn().mockImplementation();
  static setUserConfigProperties = jest.fn().mockImplementation();
  static saveNewUser = jest.fn().mockResolvedValue(userMock);
  static getActiveOrganizationUsers = jest.fn().mockResolvedValue([userMock]);
  static findActiveByEmail = jest.fn().mockImplementation();
  static findOneByEmail = jest.fn().mockImplementation();
  static findById = jest.fn().mockImplementation();
  static findOneById = jest.fn().mockImplementation();
  static disable = jest.fn().mockImplementation();
  static findUserByResetToken = jest.fn().mockImplementation();
  static getOrganizationAdmin = jest.fn().mockImplementation();
  static findByIdWithAccount = jest.fn().mockImplementation();
  static getOrganizationUsers = jest.fn().mockResolvedValue([{ ...userMock, role: ERole.HO_ADMIN }]);
  static getActiveSuperAdmins = jest.fn().mockResolvedValue([{ ...userMock, role: ERole.SUPER_ADMIN }]);
}

export class MockedDataSource {
  static findOneBy = jest.fn().mockImplementation();
  // static findOne = jest.fn().mockImplementation(() => ({
  //   getRepository: jest.fn().mockImplementation((obj) => obj)
  // }));
  static getRepository = jest.fn().mockResolvedValue(() => ({
    findOneBy: jest.fn().mockResolvedValue((obj) => obj)
  }));
}
