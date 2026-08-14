import {
  Controller,
  Get,
  Param,
  Delete,
  UseGuards,
  Put,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from 'src/modules/auth/guards/auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { JwtPayload } from 'src/common/types/jwt-payload';
import { Roles } from './decorators/user-role.decorator';
import { UserType } from 'src/common/types/enums';
import { AuthRolesGuard } from 'src/modules/auth/guards/auth-roles.guard';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(UserType.ADMIN)
  @UseGuards(AuthRolesGuard)
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
  @Roles(UserType.ADMIN, UserType.NORMAL_USER)
  @UseGuards(AuthRolesGuard)
  update(@CurrentUser() payload: JwtPayload, @Body() body: UpdateUserDto) {
    return this.usersService.update(payload.id, body);
  }

  @Get(':id')
  @Roles(UserType.ADMIN)
  @UseGuards(AuthRolesGuard)
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Delete(':id')
  @Roles(UserType.ADMIN, UserType.NORMAL_USER)
  @UseGuards(AuthRolesGuard)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() payload: JwtPayload,
  ) {
    return this.usersService.remove(id, payload);
  }
}
