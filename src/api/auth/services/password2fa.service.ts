import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuditService } from '../../audit/audit.service';
import { User } from '../../users/entities/user.entity';
import { Repository } from 'typeorm';
import { Password2fa } from '../entities/password2fa.entity';

@Injectable()
export class Password2faService {
  constructor(
    @InjectRepository(Password2fa) private password2faRepository: Repository<Password2fa>,
    private auditService: AuditService
  ) {}

  async generate2faToken(params: { newPasswordHash: string; user: User }): Promise<Password2fa> {
    const { user } = params;
    const password2faRecord = this.createRecord(params);
    // delete all previous attempts. Always latest code is valid.
    const userPassword2fa = await this.password2faRepository.find({ where: { userId: user.id } });
    await this.password2faRepository.remove(userPassword2fa);
    return this.password2faRepository.save(password2faRecord, { data: password2faRecord.user });
  }

  createRecord(params: { newPasswordHash: string; user: User }): Password2fa {
    const { user, newPasswordHash } = params;
    const verificationCode = this.generateRandom5chars();
    return this.password2faRepository.create({
      user,
      verificationCode,
      newPasswordHash
    });
  }

  async getRecord(userId: string): Promise<Password2fa> {
    const rec: Password2fa = await this.password2faRepository.findOneBy({ userId });

    if (!rec) {
      throw new HttpException('No tokens for this user', HttpStatus.NOT_FOUND);
    }
    this.auditService.log(Password2fa.name, 'FETCH', rec.user, rec);
    return rec;
  }

  async deleteUserRecords(userId: string): Promise<void> {
    const password2fa = await this.password2faRepository.findBy({ userId });
    await this.password2faRepository.remove(password2fa);
  }

  generateRandom5chars(): string {
    const fiveDigitNum = Math.floor(Math.random() * 90000) + 10000;
    return fiveDigitNum.toString();
  }
}
