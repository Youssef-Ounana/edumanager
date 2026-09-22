import { Module } from '@nestjs/common'
import { PaymentsService } from './payments.service'
import { PaymentsController } from './payments.controller'
import { PdfService } from './pdf.service'

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService, PdfService],
  exports: [PaymentsService, PdfService],
})
export class PaymentsModule {}