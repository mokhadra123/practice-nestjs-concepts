import {
  BadRequestException,
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
// import { randomBytes } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
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

    return this.usersService.create({ ...rest, password: hashedPassword });
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);

    const passwordHashed = user?.password ?? this._dummyHash;
    const isPasswordMatch = await bcrypt.compare(dto.password, passwordHashed);

    if (!user || isPasswordMatch)
      throw new UnauthorizedException('Invalid email or password.');

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
}
