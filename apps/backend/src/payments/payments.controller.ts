import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common'
import { PaymentsService } from './payments.service'
import { CreateFeeConfigDto } from './dto/create-fee-config.dto'
import { CreateInvoiceDto } from './dto/create-invoice.dto'
import { CreatePaymentDto } from './dto/create-payment.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../common/decorators/roles.decorator'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { UserRole } from '@prisma/client'

import type { Response } from 'express'
import { Res } from '@nestjs/common'
import { PdfService } from './pdf.service'


@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentsController {
  constructor(
    private paymentsService: PaymentsService,
    private pdfService: PdfService,
  ) {}

  // ─── CONFIGURATION DES FRAIS ────────────────────────────────────────────────

  // POST /api/payments/fee-configs
  @Post('fee-configs')
  @Roles(UserRole.DIRECTOR, UserRole.ACCOUNTANT)
  createFeeConfig(
    @Body() dto: CreateFeeConfigDto,
    @CurrentUser('schoolId') schoolId: string,
  ) {
    return this.paymentsService.createFeeConfig(dto, schoolId)
  }

  // GET /api/payments/fee-configs
  @Get('fee-configs')
  @Roles(UserRole.DIRECTOR, UserRole.ACCOUNTANT, UserRole.SECRETARY)
  findAllFeeConfigs(
    @CurrentUser('schoolId') schoolId: string,
    @Query('schoolYearId') schoolYearId?: string,
  ) {
    return this.paymentsService.findAllFeeConfigs(schoolId, schoolYearId)
  }

  // DELETE /api/payments/fee-configs/:id
  @Delete('fee-configs/:id')
  @Roles(UserRole.DIRECTOR)
  removeFeeConfig(
    @Param('id') id: string,
    @CurrentUser('schoolId') schoolId: string,
  ) {
    return this.paymentsService.removeFeeConfig(id, schoolId)
  }

  // ─── FACTURES ───────────────────────────────────────────────────────────────

  // POST /api/payments/invoices
  @Post('invoices')
  @Roles(UserRole.DIRECTOR, UserRole.ACCOUNTANT, UserRole.SECRETARY)
  createInvoice(
    @Body() dto: CreateInvoiceDto,
    @CurrentUser('schoolId') schoolId: string,
  ) {
    return this.paymentsService.createInvoice(dto, schoolId)
  }

  // GET /api/payments/invoices
  @Get('invoices')
  @Roles(UserRole.DIRECTOR, UserRole.ACCOUNTANT, UserRole.SECRETARY)
  findAllInvoices(
    @CurrentUser('schoolId') schoolId: string,
    @Query('studentId') studentId?: string,
  ) {
    return this.paymentsService.findAllInvoices(schoolId, studentId)
  }

  // GET /api/payments/invoices/:id
  @Get('invoices/:id')
  @Roles(UserRole.DIRECTOR, UserRole.ACCOUNTANT, UserRole.SECRETARY)
  findOneInvoice(
    @Param('id') id: string,
    @CurrentUser('schoolId') schoolId: string,
  ) {
    return this.paymentsService.findOneInvoice(id, schoolId)
  }

  // ─── PAIEMENTS ──────────────────────────────────────────────────────────────

  // POST /api/payments
  @Post()
  @Roles(UserRole.DIRECTOR, UserRole.ACCOUNTANT)
  createPayment(
    @Body() dto: CreatePaymentDto,
    @CurrentUser('schoolId') schoolId: string,
  ) {
    return this.paymentsService.createPayment(dto, schoolId)
  }

  // GET /api/payments
  @Get()
  @Roles(UserRole.DIRECTOR, UserRole.ACCOUNTANT)
  findAllPayments(@CurrentUser('schoolId') schoolId: string) {
    return this.paymentsService.findAllPayments(schoolId)
  }

  // ─── TABLEAU DE BORD ────────────────────────────────────────────────────────

  // GET /api/payments/summary
  @Get('summary')
  @Roles(UserRole.DIRECTOR, UserRole.ACCOUNTANT)
  getFinancialSummary(@CurrentUser('schoolId') schoolId: string) {
    return this.paymentsService.getFinancialSummary(schoolId)
  }


  // GET /api/payments/:id/receipt
  @Get(':id/receipt')
  @Roles(UserRole.DIRECTOR, UserRole.ACCOUNTANT, UserRole.SECRETARY)
  async downloadReceipt(
    @Param('id') id: string,
    @CurrentUser('schoolId') schoolId: string,
    @Res() res: Response,
  ) {
    const data = await this.paymentsService.getReceiptData(id, schoolId)
    const pdf = await this.pdfService.generateReceipt(data)

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="recu-${data.paymentNumber}.pdf"`,
      'Content-Length': pdf.length,
    })

    res.end(pdf)
  }
}

