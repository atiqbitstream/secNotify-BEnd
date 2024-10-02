import { InternalServerErrorException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { SALT_FACTOR } from './constants';

export const hashPassword = async (password: string): Promise<string> => {
  if (password) {
    try {
      password = await bcrypt.hash(password, SALT_FACTOR);
    } catch (e) {
      console.log('hashPassword => ', e);
      throw new InternalServerErrorException(e);
    }
    return password;
  }
  return '';
};
