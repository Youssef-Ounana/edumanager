import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private client: PrismaClient

  constructor() {
    const connectionString = process.env.DATABASE_URL!
    const adapter = new PrismaPg({ connectionString })
    this.client = new PrismaClient({ adapter } as any)
  }

  get user() { return this.client.user }
  get school() { return this.client.school }
  get schoolYear() { return this.client.schoolYear }
  get evaluationPeriod() { return this.client.evaluationPeriod }
  get classroom() { return this.client.classroom }
  get student() { return this.client.student }
  get teacher() { return this.client.teacher }
  get parent() { return this.client.parent }
  get studentParent() { return this.client.studentParent }
  get studentEnrollment() { return this.client.studentEnrollment }
  get subject() { return this.client.subject }
  get teacherSubjectAssignment() { return this.client.teacherSubjectAssignment }
  get grade() { return this.client.grade }
  get bulletin() { return this.client.bulletin }
  get bulletinEntry() { return this.client.bulletinEntry }
  get feeConfig() { return this.client.feeConfig }
  get invoice() { return this.client.invoice }
  get payment() { return this.client.payment }
  get attendance() { return this.client.attendance }
  get auditLog() { return this.client.auditLog }
  get refreshToken() { return this.client.refreshToken }
  get passwordReset() { return this.client.passwordReset }
  get $transaction() { return this.client.$transaction.bind(this.client) }

  async onModuleInit() {
    await this.client.$connect()
  }

  async onModuleDestroy() {
    await this.client.$disconnect()
  }
}