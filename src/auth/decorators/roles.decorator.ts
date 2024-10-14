import { SetMetadata } from "@nestjs/common";
import { ERole } from "src/users/enums/roles.enum";

export const ROLES_METADATA_KEY = 'roles_decorator_key';

export const Roles = (...roles:ERole[])=>
    SetMetadata(ROLES_METADATA_KEY,roles)
