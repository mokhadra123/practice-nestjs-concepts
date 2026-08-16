import { CreateUserDto } from '../dto/create-user.dto';
import { User } from '../entities/user.entity';

export type CreateUserData = CreateUserDto & {
  verificationToken?: string | null;
  verificationTokenExpiresAt?: Date | null;
};

export type ReplacePendingRegistrationData = Pick<
  User,
  'password' | 'verificationToken' | 'verificationTokenExpiresAt'
> &
  Partial<Pick<User, 'username'>>;
