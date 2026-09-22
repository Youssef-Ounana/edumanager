import * as dotenv from 'dotenv'
dotenv.config()

import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  })

  app.setGlobalPrefix('api')

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }))

  await app.listen(process.env.APP_PORT ?? 3001)
  console.log(`🚀 EduManager API démarrée sur http://localhost:${process.env.APP_PORT ?? 3001}/api`)
}

bootstrap()