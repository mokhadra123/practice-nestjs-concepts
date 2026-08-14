import { Request } from 'express';
import { CURRENT_USER_KEY } from 'src/common/constants';
import { JwtPayload } from './jwt-payload';

/**
 * An express request that has passed through `AuthGuard`.
 * The payload is optional here because the type is structural — only the
 * guard guarantees it is populated.
 */
export interface AuthenticatedRequest extends Request {
  [CURRENT_USER_KEY]?: JwtPayload;
}
