import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'
import { APP_GUARD } from '@nestjs/core'
import { PrismaModule } from './prisma/prisma.module'
import { AuthModule } from './auth/auth.module'
import { SchoolsModule } from './schools/schools.module'
import { StudentsModule } from './students/students.module'
import { SetupModule } from './setup/setup.module'
import { SchoolYearsModule } from './school-years/school-years.module'
import { ParentsModule } from './parents/parents.module'
import { PaymentsModule } from './payments/payments.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    // ─── Rate Limiting ───────────────────────────────────────────────────────
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,        // 1 seconde
        limit: 10,        // max 10 requêtes par seconde
      },
      {
        name: 'medium',
        ttl: 60000,       // 1 minute
        limit: 100,       // max 100 requêtes par minute
      },
      {
        name: 'long',
        ttl: 3600000,     // 1 heure
        limit: 1000,      // max 1000 requêtes par heure
      },
    ]),

    PrismaModule,
    AuthModule,
    SchoolsModule,
    StudentsModule,
    SetupModule,
    SchoolYearsModule,
    ParentsModule,
    PaymentsModule,
  ],
  providers: [
    // Rate limiting appliqué globalement sur toutes les routes
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}