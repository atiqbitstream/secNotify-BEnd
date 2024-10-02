import { ApiProperty } from '@nestjs/swagger';
import { JwtToken } from './jwt-token.dto';
import { UserDto } from '../../users/dto/user.dto';

export class UserLogin extends JwtToken {
  @ApiProperty({ type: () => UserDto})
  user: UserDto;
}
