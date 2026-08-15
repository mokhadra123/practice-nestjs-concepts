import { SetMetadata } from '@nestjs/common';
import { ROLES_KEY } from 'src/common/constants';
import { UserType } from 'src/common/types/enums';

export const Roles = (...roles: UserType[]) => SetMetadata(ROLES_KEY, roles);
