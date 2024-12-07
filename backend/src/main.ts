import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { mkdirSync, existsSync } from 'fs';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as bodyParser from 'body-parser'; // Import body-parser

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Ensure the directory for file uploads exists
  const uploadDir = join(__dirname, '..', 'uploads', 'cnic-images');
  if (!existsSync(uploadDir)) {
    mkdirSync(uploadDir, { recursive: true });
    console.log(`Directory ${uploadDir} created.`);
  } else {
    console.log(`Directory ${uploadDir} already exists.`);
  }

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // This enables the transformation
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // CORS configuration
  app.enableCors({
    origin: [
      process.env.WEBSITE_URL,
      'http://104.236.199.131',
      'http://localhost:3000',
      'http://localhost:5172',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
    ].filter(Boolean),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Authorization',
    exposedHeaders: 'Content-Length, X-Kuma-Revision',
    credentials: true,
    maxAge: 3600,
  });
  const port = process.env.PORT || 3000;

  app.use(bodyParser.json({ limit: '20mb' })); // Adjust the limit as needed
  app.use(bodyParser.urlencoded({ limit: '20mb', extended: true }));
  const config = new DocumentBuilder()
    .setTitle('Your API')
    .setDescription('API description')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('', app, document);
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
