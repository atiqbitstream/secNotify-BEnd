import { Account } from "src/auth/entities/account.entity";
import { ERole } from "../enums/roles.enum";

export class CreateUserDto {
  username : string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  sector?: string;
  street?: string;
  cnicNumber?: string;
  role: ERole;
  password: string;
  organizationId: number;
  organization:string;
  isTest:boolean;



}
