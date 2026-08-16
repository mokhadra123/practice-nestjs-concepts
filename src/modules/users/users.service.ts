import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import {
  CreateUserData,
  ReplacePendingRegistrationData,
} from './types/users.types';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { SALT_ROUNDS } from 'src/common/constants';
import { JwtPayload } from 'src/common/types/jwt-payload';
import { UserType } from 'src/common/types/enums';
import { join } from 'node:path';
import { unlinkSync } from 'node:fs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  create(data: CreateUserData) {
    const user = this.userRepository.create(data);
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

  /** `hash` is the SHA-256 of the emailed token, never the raw token. */
  findByVerificationToken(hash: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { verificationToken: hash } });
  }

  findByResetToken(hash: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { resetPasswordToken: hash } });
  }

  async setVerificationToken(id: number, hash: string, expiresAt: Date) {
    await this.userRepository.update(id, {
      verificationToken: hash,
      verificationTokenExpiresAt: expiresAt,
    });
  }

  async setResetToken(id: number, hash: string, expiresAt: Date) {
    await this.userRepository.update(id, {
      resetPasswordToken: hash,
      resetPasswordTokenExpiresAt: expiresAt,
    });
  }

  async replacePassword(id: number, hashedPassword: string) {
    await this.userRepository.update(id, {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordTokenExpiresAt: null,
      passwordChangedAt: new Date(),
    });
  }

  /** Flips the flag and burns the token, so a link can only be used once. */
  async markEmailVerified(id: number) {
    await this.userRepository.update(id, {
      isAccountVerified: true,
      verificationToken: null,
      verificationTokenExpiresAt: null,
    });
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

  async setProfileImage(userId: number, profileImage: string) {
    const user = await this.findOne(userId);

    if (!user.profileImage) {
      user.profileImage = profileImage;
    } else {
      await this.removeProfileImage(user.id);
      user.profileImage = profileImage;
    }

    return this.userRepository.save(user);
  }

  async removeProfileImage(userId: number) {
    const user = await this.findOne(userId);

    if (!user.profileImage)
      throw new BadRequestException('there is no profile image');

    const imagePath = join(
      process.cwd(),
      `./images/users/${user.profileImage}`,
    );
    unlinkSync(imagePath);

    user.profileImage = null;
    return this.userRepository.save(user);
  }

  async replacePendingRegistration(
    userId: number,
    data: ReplacePendingRegistrationData,
  ) {
    await this.userRepository.update(userId, data);
  }
}
