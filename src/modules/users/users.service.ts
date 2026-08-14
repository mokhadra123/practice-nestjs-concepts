import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { SALT_ROUNDS } from 'src/common/constants';
import { JwtPayload } from 'src/common/types/jwt-payload';
import { UserType } from 'src/common/types/enums';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  create(dto: CreateUserDto) {
    const user = this.userRepository.create(dto);
    return this.userRepository.save(user);
  }

  async update(id: number, dto: UpdateUserDto) {
    const { email, password, username } = dto;
    const user = await this.findOne(id);

    user.email = email ?? user.email;
    user.username = username ?? user.username;

    if (password) {
      user.password = await bcrypt.hash(password, SALT_ROUNDS);
    }

    return this.userRepository.save(user);
  }

  findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User Not Found');
    return user;
  }

  // Returns `null` when no user matches — callers decide what that means.
  findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async remove(id: number, payload: JwtPayload) {
    const user = await this.findOne(id);
    console.log('id', id);
    console.log('payload', payload);

    if (user.id === payload.id || payload.userType === UserType.ADMIN) {
      await this.userRepository.remove(user);
      return { message: 'User has been deleted Successfully' };
    }

    throw new ForbiddenException(
      'Access denied You are not allowed to delete This user',
    );
  }
}
