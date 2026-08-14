import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { CURRENT_USER_KEY } from 'src/common/constants';
import { AuthenticatedRequest } from 'src/common/types/authenticated-request';
import { UserType } from 'src/common/types/enums';
import { UsersService } from 'src/modules/users/users.service';
import { Request } from 'express';
import { JwtPayload } from 'src/common/types/jwt-payload';

@Injectable()
export class AuthRolesGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly reflector: Reflector,
    private readonly usersService: UsersService,
  ) {}

  private _extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  async canActivate(context: ExecutionContext) {
    const roles: UserType[] = this.reflector.getAllAndOverride('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!roles || !roles.length) return false;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this._extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Access token is missing');
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      const user = await this.usersService.findOne(payload.id);
      if (!user) return false;

      if (roles.includes(user.userType)) {
        request[CURRENT_USER_KEY] = payload;
        return true;
      }
    } catch {
      throw new UnauthorizedException('Access token is invalid or expired');
    }
    return false;
  }
}
