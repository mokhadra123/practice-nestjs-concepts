import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { ProductsModule } from './modules/products/products.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { UsersModule } from './modules/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './modules/products/entities/product.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Review } from './modules/reviews/entities/review.entity';
import { User } from './modules/users/entities/user.entity';
import { AuthModule } from './modules/auth/auth.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { UploadsModule } from './modules/uploads/uploads.module';

@Module({
  imports: [
    ProductsModule,
    ReviewsModule,
    UsersModule,
    UploadsModule,
    TypeOrmModule.forRootAsync({
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
          entities: [Product, Review, User],
        };
      },
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
    }),
    AuthModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
  ],
})
export class AppModule {}
