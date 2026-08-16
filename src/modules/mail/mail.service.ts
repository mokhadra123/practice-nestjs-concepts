import { Injectable, Logger } from '@nestjs/common';
import { User } from '../users/entities/user.entity';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly mailerService: MailerService) {}

  async sendMail(user: User) {
    try {
      const today = new Date();
      await this.mailerService.sendMail({
        to: user.email,
        template: 'login-alert',
        subject: 'New sign-in to your account',
        context: { user, today },
      });
    } catch (error) {
      // Rethrow the real error. Flattening every failure into one exception is
      // what made a missing template report itself as a request timeout.
      this.logger.error('Failed to send login alert', error as Error);
      throw error;
    }
  }

  async sendVerifyEmail(user: User, link: string) {
    try {
      await this.mailerService.sendMail({
        to: user.email,
        template: 'verify-email',
        subject: 'Confirm your email address',
        context: { link },
      });
    } catch (error) {
      this.logger.error('Failed to send verification email', error as Error);
      throw error;
    }
  }

  async sendResetPassword() {}
}
