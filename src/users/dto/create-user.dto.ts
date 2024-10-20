import { Account } from "src/auth/entities/account.entity";
import { ERole } from "../enums/roles.enum";

export class CreateUserDto {
  username : string;
  firstName: string;
  lastName: string;
  email: string;
  role: ERole;
  password: string;
  organizationId: string;
  organization:string;



}
