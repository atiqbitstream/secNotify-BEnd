import { ETokenType } from '../../../enums/token-type.enum';
import { User } from '../../users/entities/user.entity';

export class TokenDto {
  public expirationTime: Date;
  constructor(
    public user: User,
    public tokenType: ETokenType,
    expiration: number,
    public token: string,
    public sessionId: string
  ) {
    const now = new Date();
    this.expirationTime = new Date(now.getTime() + expiration * 1000);
  }
}
