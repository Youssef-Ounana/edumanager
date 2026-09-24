import * as dotenv from 'dotenv'
dotenv.config()

import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'
import * as helmet from 'helmet'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // ─── Helmet — Headers de sécurité ────────────────────────────────────────
  app.use(helmet.default())

  // ─── CORS — Origines autorisées ───────────────────────────────────────────
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })

  // ─── Prefix global ────────────────────────────────────────────────────────
  app.setGlobalPrefix('api')

  // ─── Validation globale ───────────────────────────────────────────────────
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }))

  await app.listen(process.env.APP_PORT ?? 3001)
  console.log(`🚀 Tinmel API démarrée sur http://localhost:${process.env.APP_PORT ?? 3001}/api`)
}

bootstrap()