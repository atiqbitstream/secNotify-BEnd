import { ApiProperty } from '@nestjs/swagger';
import { ERole } from '../../../enums/role.enum';
import { EUserStatus } from '../../../enums/user-status.enum';
import { IPaginated } from '../../../shared/dto/paginated.dto';
import { PaginationReportDto } from '../../../shared/dto/pagination-report-dto';
import { IUser } from '../interfaces/user.interface';
import { Organization } from '../../organization/entities/organization.entity';

export class UserOverviewDto implements IUser {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  jobTitle: string;

  @ApiProperty()
  phoneNumber: string;

  @ApiProperty({ enum: ERole })
  role: ERole;

  @ApiProperty({ enum: EUserStatus })
  status: EUserStatus;

  @ApiProperty({ type: () => Organization })
  organization?: Organization;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  createdAt: Date;
}

export class PaginatedUsersDto implements IPaginated<UserOverviewDto> {
  @ApiProperty({ type: () => [UserOverviewDto] })
  data: UserOverviewDto[];

  @ApiProperty()
  meta: PaginationReportDto;
}
