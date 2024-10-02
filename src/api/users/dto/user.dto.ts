import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RideOption } from '../../ride-options/entities/ride-option.entity';
import { ERole } from '../../../enums/role.enum';
import { EUserStatus } from '../../../enums/user-status.enum';
import { EUSTimezones } from '../../../enums/timezones.enum';
import { User } from '../entities/user.entity';
import { IsArray, IsOptional } from 'class-validator';

export class UserDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  phoneNumber: string;

  @ApiProperty()
  jobTitle: string;

  @ApiProperty({ enum: ERole })
  role: ERole;

  @ApiProperty({ enum: EUserStatus })
  status: EUserStatus;

  @ApiProperty()
  organizationId?: string;

  @ApiProperty({ enum: EUSTimezones })
  preferredTimezone?: EUSTimezones;

  @ApiPropertyOptional()
  @IsOptional()
  vehicleTypes?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  canReceiveSms?: boolean;

  @ApiPropertyOptional({ type: () => [RideOption] })
  @IsOptional()
  @IsArray()
  rideOptions: RideOption[];

  @ApiPropertyOptional()
  @IsOptional()
  permission?: { hoList: [string] };

  @ApiPropertyOptional()
  @IsOptional()
  hasAccount?: boolean;

  static fromEntity(user: User) {
    const userDto = new UserDto();

    userDto.id = user.id;
    userDto.createdAt = user.createdAt;
    userDto.updatedAt = user.updatedAt;
    userDto.firstName = user.firstName;
    userDto.lastName = user.lastName;
    userDto.email = user.email;
    userDto.role = user.role;
    userDto.status = user.status;
    userDto.organizationId = user.organizationId;
    userDto.preferredTimezone = user.preferredTimezone;

    if (user.permission) {
      userDto.permission = user.permission;
    }

    if (user.jobTitle) {
      userDto.jobTitle = user.jobTitle;
    }

    if (user.phoneNumber) {
      userDto.phoneNumber = user.phoneNumber;
    }

    if (user.role === ERole.DRIVER) {
      userDto.canReceiveSms = user.canReceiveSms;
      userDto.vehicleTypes = user.vehicleTypes;
      userDto.rideOptions = user.rideOptions;

      if (user.account) {
        userDto.hasAccount = user.account?.password ? true : false;
      }
    }

    return userDto;
  }
}
