import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ChangeEmailDTO {
  @ApiProperty()
  @IsEmail()
  newEmail: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  password: string;
}
