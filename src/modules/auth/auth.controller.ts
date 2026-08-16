import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { CurrentUser, Public } from 'src/common/decorators';
import { ThrottleAuth } from './decorators/throttle.decorator';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Protected } from 'src/common/decorators/protected.decorator';
import { ChangePasswordDto } from './dto/change-password.dto';
import type { JwtPayload } from 'src/common/types/jwt-payload';
import { ForgotPasswordDto } from './dto/forget-password.dto';

@Public()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ThrottleAuth(10)
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @ThrottleAuth(10)
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // No user id in the path: a 256-bit token is already unique, and every extra
  // path segment is another input to validate and another thing to tamper with.
  @Get('verify-email/:token')
  @ThrottleAuth(10)
  verifyEmail(@Param('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  @ThrottleAuth(3)
  resendVerification(@Body() dto: ResendVerificationDto) {
    return this.authService.resendVerification(dto.email);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ThrottleAuth(3)
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgetPassword(dto);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ThrottleAuth(3)
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Protected()
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @ThrottleAuth(3)
  changePassword(
    @CurrentUser() payload: JwtPayload,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(payload.id, dto);
  }
}
