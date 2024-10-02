import * as crypto from 'crypto';
import { DayInMilliseconds } from './constants';
import * as bcrypt from 'bcryptjs';
import { InternalServerErrorException } from '@nestjs/common';

export function generateResetPasswordToken(): string {
  return crypto.randomBytes(13).toString('hex');
}

export function generateResetPasswordTokenExpirationDate(): Date {
  return new Date(Date.now() + DayInMilliseconds);
}

export async function isSamePassword(password: string, hashedPassword: string): Promise<boolean> {
  try {
    return bcrypt.compare(password, hashedPassword);
  } catch (e) {
    console.log('Reset-password, isSamePassword => ', e);
    throw new InternalServerErrorException(e);
  }
}
