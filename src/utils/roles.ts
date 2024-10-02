import { BadRequestException } from '@nestjs/common';
import { ERole, ERolePatient } from '../enums/role.enum';

export const AVAILABLE_USERS_FOR_ROLE = {
  [ERole.TC_ADMIN]: [ERole.TC_ADMIN, ERole.TC_EMPLOYEE],
  [ERole.TC_EMPLOYEE]: [ERole.TC_ADMIN, ERole.TC_EMPLOYEE],
  [ERole.HO_ADMIN]: [ERole.HO_ADMIN, ERole.HO_EMPLOYEE],
  [ERole.HO_EMPLOYEE]: [ERole.HO_ADMIN, ERole.HO_EMPLOYEE],
  [ERole.SUPER_ADMIN]: [ERole.SUPER_ADMIN]
};

export const MANAGEABLE_USERS_FOR_ROLE = {
  [ERole.TC_ADMIN]: [ERole.TC_ADMIN, ERole.TC_EMPLOYEE, ERole.DRIVER],
  [ERole.TC_EMPLOYEE]: [ERole.DRIVER],
  [ERole.HO_ADMIN]: [ERole.HO_ADMIN, ERole.HO_EMPLOYEE],
  [ERole.SUPER_ADMIN]: [ERole.SUPER_ADMIN]
};

export const MANAGER_ROLES = [ERole.TC_EMPLOYEE, ERole.HO_EMPLOYEE];

export const TC_ROLES = [ERole.TC_EMPLOYEE, ERole.TC_ADMIN];

export const HO_ROLES = [ERole.HO_EMPLOYEE, ERole.HO_ADMIN];

export const TC_ACCOUNTS = [ERole.TC_EMPLOYEE, ERole.TC_ADMIN, ERole.DRIVER];

export const RIDER_ROLES: string[] = [ERolePatient.RIDER, ERolePatient.CAREGIVER];

export const getRoleByCreator = (creatorRole: ERole): ERole => {
  switch (creatorRole) {
    case ERole.SUPER_ADMIN:
      return ERole.SUPER_ADMIN;
    case ERole.HO_ADMIN:
      return ERole.HO_EMPLOYEE;
    case ERole.TC_ADMIN:
      return ERole.TC_EMPLOYEE;
    default: {
      throw new BadRequestException('Role not found');
    }
  }
};
