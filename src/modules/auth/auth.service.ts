import {
  BadRequestException,
  ForbiddenException,
  HttpStatus,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from 'src/modules/users/users.service';
import { JwtPayload } from 'src/common/types/jwt-payload';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { SALT_ROUNDS } from 'src/common/constants';
import { MailService } from '../mail/mail.service';
import { ConfigService } from '@nestjs/config';
import { createHash, randomBytes } from 'crypto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  private static readonly VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000;

  /**
   * A bcrypt hash of a value nobody knows, generated once at boot. Compared
   * against when an email has no account, so both login failure paths cost the
   * same ~50ms and response time can't reveal whether the account exists.
   */
  private readonly _dummyHash = bcrypt.hashSync(
    randomBytes(32).toString('hex'),
    SALT_ROUNDS,
  );

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const { password, ...rest } = dto;

    const existingUser = await this.usersService.findByEmail(dto.email);
    if (existingUser) throw new BadRequestException('user already exist');

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const { token, hash, expiresAt } = this._createVerificationToken();

    const user = await this.usersService.create({
      ...rest,
      password: hashedPassword,
      verificationToken: hash,
      verificationTokenExpiresAt: expiresAt,
    });

    this._sendVerificationEmail(user, token);

    // No access token here on purpose — verification would be optional otherwise.
    return { message: 'A verification link has been sent to your email.' };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);

    // bcrypt runs even with no user, so both failures take the same time.
    const passwordHashed = user?.password ?? this._dummyHash;
    const isPasswordMatch = await bcrypt.compare(dto.password, passwordHashed);

    // One condition, one throw: two branches could drift apart later.
    if (!user || !isPasswordMatch) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    // Deliberately AFTER the password check. Before it, an unverified-account
    // error would tell a stranger the address is registered.
    if (!user.isAccountVerified) {
      const { token, hash, expiresAt } = this._createVerificationToken();
      await this.usersService.setVerificationToken(user.id, hash, expiresAt);
      this._sendVerificationEmail(user, token);

      throw new ForbiddenException({
        statusCode: HttpStatus.FORBIDDEN,
        error: 'Forbidden',
        code: 'Email_NOT_VERIFIED',
        message:
          'Please verify your email address before signing in. A new verification link has been sent to your email.',
      });
    }

    const payload: JwtPayload = {
      id: user.id,
      username: user.username,
      userType: user.userType,
    };
    const accessToken = await this.jwtService.signAsync(payload);

    void this.mailService
      .sendMail(user)
      .catch((err) => this.logger.error('Login alert email failed', err));

    return { access_token: accessToken };
  }

  async verifyEmail(rawToken: string) {
    const user = await this.usersService.findByVerificationToken(
      this._hashToken(rawToken),
    );

    // One message for unknown, already-used, and expired tokens alike —
    // distinguishing them would confirm which tokens once existed.
    if (
      !user ||
      !user.verificationTokenExpiresAt ||
      user.verificationTokenExpiresAt < new Date()
    ) {
      throw new BadRequestException(
        'This verification link is invalid or has expired.',
      );
    }

    await this.usersService.markEmailVerified(user.id);

    return { message: 'Your email has been verified. You can now sign in.' };
  }

  async resendVerification(email: string) {
    const user = await this.usersService.findByEmail(email);

    if (user && !user.isAccountVerified) {
      const { token, hash, expiresAt } = this._createVerificationToken();
      await this.usersService.setVerificationToken(user.id, hash, expiresAt);
      this._sendVerificationEmail(user, token);
    }

    // Identical response either way, so this can't be used to probe for accounts.
    return {
      message:
        'If that account exists and is unverified, a new link has been sent.',
    };
  }

  /** The raw token goes in the email; only its hash is ever stored. */
  private _createVerificationToken() {
    const token = randomBytes(32).toString('hex');

    return {
      token,
      hash: this._hashToken(token),
      expiresAt: new Date(Date.now() + AuthService.VERIFICATION_TTL_MS),
    };
  }

  private _hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private _sendVerificationEmail(user: User, rawToken: string) {
    const domain = this.configService.get<string>('DOMAIN');
    const link = `${domain}/api/v1/auth/verify-email/${rawToken}`;

    void this.mailService
      .sendVerifyEmail(user, link)
      .catch((err) =>
        this.logger.error(`Verification email failed for user ${user.id}`, err),
      );
  }
}
