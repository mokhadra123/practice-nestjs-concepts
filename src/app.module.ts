import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { ProductsModule } from './modules/products/products.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { UsersModule } from './modules/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { UploadsModule } from './modules/uploads/uploads.module';
import { MailModule } from './modules/mail/mail.module';
import { AuthGuard } from './modules/auth/guards/auth.guard';
import { JwtModule } from '@nestjs/jwt';
import { authConfig } from './modules/auth/config/auth.config';
import { typeOrmConfig } from './common/config/typeorm.config';
import { configModuleConfig } from './common/config/config-module.config';
import { RolesGuard } from './modules/auth/guards/roles.guard';

@Module({
  imports: [
    ProductsModule,
    ReviewsModule,
    UsersModule,
    UploadsModule,
    MailModule,
    AuthModule,
    TypeOrmModule.forRootAsync(typeOrmConfig),
    JwtModule.registerAsync(authConfig),
    ConfigModule.forRoot(configModuleConfig),
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: ClassSerializerInterceptor },
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
