import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ResendInviteDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  key: string;

  @ApiProperty()
  @IsEmail()
  email: string;
}
