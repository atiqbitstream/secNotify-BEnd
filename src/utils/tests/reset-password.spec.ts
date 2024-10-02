import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';

import {
  generateResetPasswordToken,
  generateResetPasswordTokenExpirationDate,
  isSamePassword
} from '../reset-password';
import { DayInMilliseconds } from '../constants';

const resetPasswordToken = 'token';
const toString = jest.fn().mockReturnValue(resetPasswordToken);
jest.mock('crypto', () => ({
  randomBytes: jest.fn().mockImplementation(() => ({ toString }))
}));
jest.mock('bcryptjs', () => ({
  compare: jest.fn()
}));

describe('reset-password', () => {
  describe('generateResetPasswordToken', () => {
    it('should return reset password token', () => {
      const randomBytesSpy = jest.spyOn(crypto, 'randomBytes');
      expect(generateResetPasswordToken()).toEqual(resetPasswordToken);
      expect(randomBytesSpy).toHaveBeenCalledWith(13);
      expect(toString).toHaveBeenCalledWith('hex');
    });
  });
  describe('generateResetPasswordTokenExpirationDate', () => {
    it(' password token', () => {
      const dateMock = new Date('2021-07-23T13:30:00.460Z').getTime();
      jest.spyOn(Date, 'now').mockReturnValueOnce(dateMock);
      expect(generateResetPasswordTokenExpirationDate()).toEqual(new Date(dateMock + DayInMilliseconds));
    });
  });
  describe('isSamePassword', () => {
    it('should return reset password token', async () => {
      const expectedResponse = true;
      const compareSpy = jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(expectedResponse);
      const password = '1';
      const hashedPassword = '2';
      await expect(isSamePassword(password, hashedPassword)).resolves.toEqual(expectedResponse);
      expect(compareSpy).toHaveBeenCalledWith(password, hashedPassword);
    });
  });
});
