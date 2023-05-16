import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  const PORT = process.env.PORT || 4000;
  await app.listen(PORT, () => Logger.log(`🚀 Server has been started on PORT: ${PORT}/${globalPrefix}`))
}

bootstrap();
