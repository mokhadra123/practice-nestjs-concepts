import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';

import { Product } from 'src/modules/products/entities/product.entity';
import { Review } from 'src/modules/reviews/entities/review.entity';
import { User } from 'src/modules/users/entities/user.entity';

const entities = [Product, Review, User];

export const typeOrmConfig: TypeOrmModuleAsyncOptions = {
  inject: [ConfigService],
  useFactory: (config: ConfigService) => {
    return {
      type: 'postgres',
      database: config.get<string>('DB_NAME'),
      username: config.get<string>('DB_USERNAME'),
      password: config.get<string>('DB_PASSWORD'),
      port: config.get<number>('DB_PORT'),
      host: config.get<string>('DB_HOST'),
      synchronize: process.env.NODE_ENV !== 'production',
      entities,
    };
  },
};
