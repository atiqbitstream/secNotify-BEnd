import { userStub } from '../../../health-organizations/tests/stubs/user.stub';
import { Password2fa } from '../../../auth/entities/password2fa.entity';

export const password2faMock: Password2fa = {
  id: 'id',
  createdAt: new Date(),
  updatedAt: new Date(),
  newPasswordHash: 'hash',
  userId: 'user',
  verificationCode: '12345',
  preInsert: async () => {
    //
  },
  preUpdate: async () => {
    //
  },
  user: userStub()
};

export class MockedPassword2faService {
  static generate2faToken = jest.fn().mockResolvedValue(password2faMock);
  static getRecord = jest.fn().mockResolvedValue(password2faMock);
  static deleteUserRecords = jest.fn().mockResolvedValue({});

  static createRecord = jest.fn().mockReturnValue(password2faMock);
  static generateRandom5chars = jest.fn().mockResolvedValue({});
}

export class Password2faEntityMock {
  static findBy = jest.fn().mockImplementation();
  static findOneBy = jest.fn().mockImplementation();
  static remove = jest.fn().mockImplementation();
}
