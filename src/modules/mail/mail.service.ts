import { Injectable, RequestTimeoutException } from '@nestjs/common';
import { User } from '../users/entities/user.entity';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendMail(user: User) {
    try {
      const today = new Date();
      await this.mailerService.sendMail({
        to: user.email,
        template: 'login-alert',
        subject: 'login email',
        context: { user, today },
      });
    } catch (error) {
      console.log(error);
      throw new RequestTimeoutException();
    }
  }

  async sendVerifyEmail(user: User, link: string) {
    try {
      await this.mailerService.sendMail({
        to: user.email,
        template: 'verify-email',
        subject: 'Token Email verification',
        context: { link },
      });
    } catch (error) {
      console.log(error);
      throw new RequestTimeoutException();
    }
  }
}
