import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.setGlobalPrefix('api');

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.enableCors({
    origin: 'http://localhost:3000',
  });

  const swagger = new DocumentBuilder()
    .setTitle('Nestjs Course - App Api')
    .setVersion('1.0')
    .addServer('http://localhost:5000')
    .setLicense('khadra license', 'Ala ma tofrag')
    .build();
  const documentation = SwaggerModule.createDocument(app, swagger);
  SwaggerModule.setup('api-docs', app, documentation);

  await app.listen(process.env.PORT ?? 5000);
}
bootstrap();
