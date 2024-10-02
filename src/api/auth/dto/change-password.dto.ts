import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class ChangePasswordDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Length(8, 50)
  newPassword: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Length(8, 50)
  oldPassword: string;
}
