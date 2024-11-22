import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ERole } from 'src/users/enums/roles.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { DONT_HAVE_PERMISSIONS } from 'src/utils/error-messages';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<ERole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass()
    ]);

    console.log("reuqiredRoles : ",requiredRoles)

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    console.log(" thie is {user} object from SNB Role guard  : ",{user})
    const isRoleMatched = requiredRoles.some((role) => user.role === role);

    console.log("is role matched : ",isRoleMatched)

    if (!isRoleMatched) {
      throw new ForbiddenException(DONT_HAVE_PERMISSIONS);
    }

    return true;
  }
}
