import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { ERole } from '../../../enums/role.enum';

export class LoginAsRoleDto {
  @ApiProperty({ enum: ERole })
  @IsNotEmpty()
  @IsEnum(ERole)
  role: ERole;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  organizationId: string;
}
