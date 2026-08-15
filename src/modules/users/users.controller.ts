import {
  Controller,
  Get,
  Param,
  Delete,
  UseGuards,
  Put,
  Body,
  ParseIntPipe,
  Post,
  UseInterceptors,
  BadRequestException,
  UploadedFile,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from 'src/modules/auth/guards/auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { JwtPayload } from 'src/common/types/jwt-payload';
import { Roles } from './decorators/user-role.decorator';
import { UserType } from 'src/common/types/enums';
import { UpdateUserDto } from './dto/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(UserType.ADMIN)
  findAll() {
    return this.usersService.findAll();
  }

  // Must stay above `@Get(':id')` — a dynamic segment would swallow `/users/me`.
  @Get('me')
  @UseGuards(AuthGuard)
  getCurrentUser(@CurrentUser() payload: JwtPayload) {
    return this.usersService.findOne(payload.id);
  }

  @Put('update')
  @Roles(UserType.ADMIN)
  update(@CurrentUser() payload: JwtPayload, @Body() body: UpdateUserDto) {
    return this.usersService.update(payload.id, body);
  }

  @Post('upload-image')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('user-image'))
  uploadProfileImage(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() payload: JwtPayload,
  ) {
    if (!file) throw new BadRequestException('no Image provided');

    return this.usersService.setProfileImage(payload.id, file.filename);
  }

  @Delete('remove-profile-image')
  removeProfileImage(@CurrentUser() payload: JwtPayload) {
    return this.usersService.removeProfileImage(payload.id);
  }

  @Get(':id')
  @Roles(UserType.ADMIN)
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() payload: JwtPayload,
  ) {
    return this.usersService.remove(id, payload);
  }
}
