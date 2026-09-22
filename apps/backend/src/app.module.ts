import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
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
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    SchoolsModule,
    StudentsModule,
    SetupModule,
    SchoolYearsModule,
    ParentsModule,
    PaymentsModule,
  ],
})
export class AppModule {}