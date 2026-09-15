import * as dotenv from 'dotenv'
dotenv.config()

import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.setGlobalPrefix('api')

  await app.listen(process.env.APP_PORT ?? 3001)
  console.log(`🚀 EduManager API démarrée sur http://localhost:${process.env.APP_PORT ?? 3001}/api`)
}

bootstrap()