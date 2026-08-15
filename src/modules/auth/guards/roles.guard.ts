import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CURRENT_USER_KEY, ROLES_KEY } from 'src/common/constants';
import { AuthenticatedRequest } from 'src/common/types/authenticated-request';
import { UserType } from 'src/common/types/enums';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles: UserType[] = this.reflector.getAllAndOverride(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // No @Roles() on this route - Just Authentication is enough
    if (!roles?.length) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request[CURRENT_USER_KEY];

    if (!user)
      throw new UnauthorizedException('Authentication required for this route');

    if (!roles.includes(user.userType))
      throw new ForbiddenException('You do not have access to this resources');

    return true;
  }
}
