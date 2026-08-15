import { ConfigService } from '@nestjs/config';
import { StringValue } from 'ms';

export const authConfig = {
  global: true,
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => ({
    secret: configService.get<string>('JWT_SECRET'),
    signOptions: {
      expiresIn: configService.get<StringValue>('JWT_EXPIRES_IN'),
    },
  }),
};
