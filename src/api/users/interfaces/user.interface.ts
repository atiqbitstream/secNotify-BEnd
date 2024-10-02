import { Account } from '../../auth/entities/account.entity';
import { RideOption } from '../../ride-options/entities/ride-option.entity';
import { ERole } from '../../../enums/role.enum';
import { EUserStatus } from '../../../enums/user-status.enum';
import { EUSTimezones } from '../../../enums/timezones.enum';

export interface IUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  jobTitle?: string;
  role?: ERole;
  status?: EUserStatus;
  isTest?: boolean;
  preferredTimezone?: EUSTimezones;

  // driver
  vehicleTypes?: string[];
  canReceiveSms?: boolean;

  // meta
  updatedAt: Date;
  createdAt: Date;

  // relations
  organization?: any;
  rideOptions?: RideOption[];
  account?: Account;

  permission?: { hoList: [string] };
}
