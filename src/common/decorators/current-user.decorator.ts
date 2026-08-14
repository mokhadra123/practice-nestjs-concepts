import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { CURRENT_USER_KEY } from 'src/common/constants';
import { AuthenticatedRequest } from 'src/common/types/authenticated-request';
import { JwtPayload } from 'src/common/types/jwt-payload';

/**
 * Reads the payload that `AuthGuard` attached to the request.
 * Only valid on routes protected by `AuthGuard` — without it the payload is
 * absent and the handler receives `undefined`.
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): JwtPayload | undefined => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    return request[CURRENT_USER_KEY];
  },
);
