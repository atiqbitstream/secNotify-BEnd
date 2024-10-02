import { ERole } from '../enums/role.enum';

export interface UserConfig {
  organizationId?: string;
  role: ERole;
  isTest: boolean;
  hasAccount?: boolean;
}
