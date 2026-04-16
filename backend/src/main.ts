import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './filters/global-exception.filter';

async function bootstrap() {
  console.log('[Nest] Starting bootstrap process...');
  const app = await NestFactory.create(AppModule);
  
  // Clean up CORS for local development
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  
  // Set global prefix to avoid repeating 'api/' in every controller
  app.setGlobalPrefix('api');
  
  // Global Resilience Layer
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: false, // Changed to false to be more flexible with extra fields
  }));

  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on: http://127.0.0.1:${port}/api`);
}
bootstrap();
