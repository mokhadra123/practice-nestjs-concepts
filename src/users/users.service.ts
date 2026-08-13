import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const { password, ...rest } = dto;
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (user) throw new BadRequestException('user already exist');

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = this.userRepository.create({
      ...rest,
      password: hashedPassword,
    });

    return this.userRepository.save(newUser);
  }

  async login(dto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (!user) throw new NotFoundException('User Not Found');

    const isPasswordMatch =  await bcrypt.compare(dto.password, user.password);

    if (!isPasswordMatch)
      throw new UnauthorizedException('Email or password is wrong');
    const payload = { sub: user.id, username: user.username };

    return {
      access_token: this.jwtService.signAsync(payload),
    };
  }

  findAll() {
    return `This action returns all users`;
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User Not Found');
    return user;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
