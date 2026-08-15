import {
  BadRequestException,
  Injectable,
  NotFoundException,
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

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
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
    if (!user) throw new NotFoundException('User Not Found');

    const isPasswordMatch = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordMatch)
      throw new UnauthorizedException('Email or password is wrong');

    const payload: JwtPayload = {
      id: user.id,
      username: user.username,
      userType: user.userType,
    };
    const accessToken = await this.jwtService.signAsync(payload);

    await this.mailService.sendMail(user);

    return { access_token: accessToken };
  }
}
