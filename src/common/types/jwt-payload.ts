import { UserType } from './enums';

/**
 * Shape of the decoded access token.
 * Must stay in sync with the payload signed in `AuthService.login()`.
 */
export interface JwtPayload {
  id: number;
  username: string;
  userType: UserType;
  /** Issued at / expires at — added by jsonwebtoken, not by us. */
  iat?: number;
  exp?: number;
}
