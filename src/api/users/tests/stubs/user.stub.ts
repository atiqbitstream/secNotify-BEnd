import { User } from '../../entities/user.entity';
import { Organization } from '../../../organization/entities/organization.entity';
import { Account } from '../../../auth/entities/account.entity';
import { UpdateUserDto } from '../../dto/update-user.dto';
import { ERole } from '../../../../enums/role.enum';
import { EUserStatus } from '../../../../enums/user-status.enum';
import { EUSTimezones } from '../../../../enums/timezones.enum';

export const account = (): Account => {
  const acc = new Account();
  acc.password = 'password';
  acc.blockedUntil = null;
  acc.failedLoginAttempts = 0;
  acc.lastFailedLogin = null;
  acc.resetPasswordExpires = new Date(1622722779771);
  acc.resetPasswordToken = 'f5d7579f6d0e7909baa808ddc9';
  return acc;
};

export const invitedUserStub = (): Partial<User> => ({
  id: '60d46c2fac4d5ade041da0d9',
  status: EUserStatus.INVITED,
  role: ERole.TC_ADMIN,
  firstName: 'Dan',
  lastName: 'Cole',
  email: 'invited@jq600.com',
  organizationId: '60d46c2fac4d5ade041da0d9',
  createdAt: new Date('2021-06-24T11:29:36.226Z'),
  updatedAt: new Date('2021-06-29T11:02:26.821Z'),
  jobTitle: 'USER'
});

export const superAdminStub = (): User => ({
  id: '35315a64-9e67-4b12-9f1e-7a2a143d152e',
  status: EUserStatus.ACTIVE,
  role: ERole.SUPER_ADMIN,
  firstName: 'Dan',
  lastName: 'Cole',
  email: 'hasice6802@jq600.com',
  organization: { id: 'orgId' } as Organization,
  organizationId: 'orgId',
  createdAt: new Date('2021-06-24T11:29:36.226Z'),
  updatedAt: new Date('2021-06-29T11:02:26.821Z'),
  jobTitle: 'USER',
  phoneNumber: '1234567890',
  account: account(),
  preferredTimezone: EUSTimezones.CST,
  isTest: false
});

export const newUserStub = (): User => ({
  id: 'id',
  status: EUserStatus.ACTIVE,
  role: undefined,
  firstName: 'Dan',
  lastName: 'Cole',
  email: 'hasice6802@jq600.com',
  organizationId: undefined,
  createdAt: new Date('2021-06-24T11:29:36.226Z'),
  updatedAt: new Date('2021-06-29T11:02:26.821Z'),
  jobTitle: 'USER',
  phoneNumber: '1234567890',
  account: undefined,
  preferredTimezone: EUSTimezones.CST,
  isTest: undefined
});

export const userDtoStub = (): UpdateUserDto => ({
  firstName: 'Dan',
  lastName: 'Cole',
  email: 'newuser@gmail.com',
  jobTitle: 'USER',
  phoneNumber: '1234567890'
});

export const tcAdminStub = (): User => ({
  id: 'id',
  status: EUserStatus.ACTIVE,
  role: ERole.TC_ADMIN,
  firstName: 'Dan',
  lastName: 'Cole',
  email: 'hasice6802@jq600.com',
  organizationId: 'orgId',
  createdAt: new Date('2021-06-24T11:29:36.226Z'),
  updatedAt: new Date('2021-06-29T11:02:26.821Z'),
  jobTitle: 'USER',
  phoneNumber: '1234567890',
  account: account(),
  preferredTimezone: EUSTimezones.CST,
  isTest: false
});
