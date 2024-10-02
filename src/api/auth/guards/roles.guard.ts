import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ERole } from '../../../enums/role.enum';
import { ROLES_KEY } from '../../../decorators/roles.decorator';
import { DONT_HAVE_PERMISSIONS } from '../../../utils/error-messages';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<ERole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass()
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    const isRoleMatched = requiredRoles.some((role) => user.role === role);

    if (!isRoleMatched) {
      throw new ForbiddenException(DONT_HAVE_PERMISSIONS);
    }

    return true;
  }
}
