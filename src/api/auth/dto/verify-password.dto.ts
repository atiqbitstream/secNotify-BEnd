import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class VerifyPasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly token: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Length(8, 50)
  newPassword;
}
