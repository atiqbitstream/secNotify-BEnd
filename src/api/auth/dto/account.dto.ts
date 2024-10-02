import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDefined, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class AccountDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  jobTitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  phoneNumber?: string;

  @ApiProperty()
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @Length(8, 50)
  password: string;
}
