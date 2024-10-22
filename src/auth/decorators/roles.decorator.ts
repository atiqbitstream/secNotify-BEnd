import { CustomDecorator, SetMetadata } from '@nestjs/common';
import { ERole } from 'src/users/enums/roles.enum';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: ERole[]): CustomDecorator<string> => SetMetadata(ROLES_KEY, roles);
