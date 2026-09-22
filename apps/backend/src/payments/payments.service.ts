import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateFeeConfigDto } from './dto/create-fee-config.dto'
import { CreateInvoiceDto } from './dto/create-invoice.dto'
import { CreatePaymentDto } from './dto/create-payment.dto'

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  // ─── CONFIGURATION DES FRAIS ────────────────────────────────────────────────

  async createFeeConfig(dto: CreateFeeConfigDto, schoolId: string) {
    const schoolYear = await this.prisma.schoolYear.findFirst({
      where: { id: dto.schoolYearId, schoolId },
    })

    if (!schoolYear) {
      throw new NotFoundException(`Année scolaire introuvable`)
    }

    return this.prisma.feeConfig.create({
      data: {
        name: dto.name,
        type: dto.type,
        amount: dto.amount,
        dueDay: dto.dueDay,
        description: dto.description,
        schoolYearId: dto.schoolYearId,
        schoolId,
      },
    })
  }

  async findAllFeeConfigs(schoolId: string, schoolYearId?: string) {
    return this.prisma.feeConfig.findMany({
      where: {
        schoolId,
        ...(schoolYearId && { schoolYearId }),
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async removeFeeConfig(id: string, schoolId: string) {
    const feeConfig = await this.prisma.feeConfig.findFirst({
      where: { id, schoolId },
    })

    if (!feeConfig) {
      throw new NotFoundException(`Configuration de frais introuvable`)
    }

    await this.prisma.feeConfig.delete({ where: { id } })
    return { message: 'Configuration supprimée avec succès' }
  }

  // ─── FACTURES ───────────────────────────────────────────────────────────────

  async createInvoice(dto: CreateInvoiceDto, schoolId: string) {
    const student = await this.prisma.student.findFirst({
      where: { id: dto.studentId, schoolId },
    })

    if (!student) {
      throw new NotFoundException(`Élève introuvable`)
    }

    const feeConfig = await this.prisma.feeConfig.findFirst({
      where: { id: dto.feeConfigId, schoolId },
    })

    if (!feeConfig) {
      throw new NotFoundException(`Configuration de frais introuvable`)
    }

    // Générer le numéro de facture
    const count = await this.prisma.invoice.count({
      where: { schoolId },
    })
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`

    return this.prisma.invoice.create({
      data: {
        invoiceNumber,
        studentId: dto.studentId,
        feeConfigId: dto.feeConfigId,
        schoolId,
        amount: feeConfig.amount,
        remainingAmount: feeConfig.amount,
        dueDate: new Date(dto.dueDate),
        notes: dto.notes,
      },
    })
  }

  async findAllInvoices(schoolId: string, studentId?: string) {
    return this.prisma.invoice.findMany({
      where: {
        schoolId,
        ...(studentId && { studentId }),
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        invoiceNumber: true,
        amount: true,
        paidAmount: true,
        remainingAmount: true,
        status: true,
        dueDate: true,
        notes: true,
        createdAt: true,
        feeConfig: {
          select: { name: true, type: true },
        },
      },
    })
  }

  async findOneInvoice(id: string, schoolId: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, schoolId },
      select: {
        id: true,
        invoiceNumber: true,
        amount: true,
        paidAmount: true,
        remainingAmount: true,
        status: true,
        dueDate: true,
        notes: true,
        createdAt: true,
        feeConfig: {
          select: { name: true, type: true, description: true },
        },
        payments: {
          select: {
            id: true,
            paymentNumber: true,
            amount: true,
            method: true,
            reference: true,
            paidAt: true,
          },
          orderBy: { paidAt: 'desc' },
        },
      },
    })

    if (!invoice) {
      throw new NotFoundException(`Facture introuvable`)
    }

    return invoice
  }

  // ─── PAIEMENTS ──────────────────────────────────────────────────────────────

  async createPayment(dto: CreatePaymentDto, schoolId: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id: dto.invoiceId, schoolId },
    })

    if (!invoice) {
      throw new NotFoundException(`Facture introuvable`)
    }

    if (invoice.status === 'PAID') {
      throw new BadRequestException(`Cette facture est déjà payée`)
    }

    if (invoice.status === 'CANCELLED') {
      throw new BadRequestException(`Cette facture est annulée`)
    }

    if (dto.amount > invoice.remainingAmount) {
      throw new BadRequestException(
        `Le montant payé (${dto.amount}) dépasse le montant restant (${invoice.remainingAmount})`
      )
    }

    // Générer le numéro de paiement
    const count = await this.prisma.payment.count({
      where: { schoolId },
    })
    const paymentNumber = `PAY-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`

    // Calculer les nouveaux montants
    const newPaidAmount = invoice.paidAmount + dto.amount
    const newRemainingAmount = invoice.remainingAmount - dto.amount
    const newStatus = newRemainingAmount === 0 ? 'PAID' : 'PARTIAL'

    // Créer le paiement et mettre à jour la facture en transaction
    const result = await this.prisma.$transaction(async (tx: any) => {
      const payment = await tx.payment.create({
        data: {
          paymentNumber,
          invoiceId: dto.invoiceId,
          schoolId,
          amount: dto.amount,
          method: dto.method,
          reference: dto.reference,
        },
      })

      await tx.invoice.update({
        where: { id: dto.invoiceId },
        data: {
          paidAmount: newPaidAmount,
          remainingAmount: newRemainingAmount,
          status: newStatus,
        },
      })

      return payment
    })

    return result
  }

  async findAllPayments(schoolId: string) {
    return this.prisma.payment.findMany({
      where: { schoolId },
      orderBy: { paidAt: 'desc' },
      select: {
        id: true,
        paymentNumber: true,
        amount: true,
        method: true,
        reference: true,
        paidAt: true,
        invoice: {
          select: {
            invoiceNumber: true,
            feeConfig: { select: { name: true } },
          },
        },
      },
    })
  }

  // ─── TABLEAU DE BORD FINANCIER ──────────────────────────────────────────────

  async getFinancialSummary(schoolId: string) {
    const [totalInvoiced, totalPaid, pendingInvoices, overdueInvoices] =
      await Promise.all([
        this.prisma.invoice.aggregate({
          where: { schoolId },
          _sum: { amount: true },
        }),
        this.prisma.invoice.aggregate({
          where: { schoolId },
          _sum: { paidAmount: true },
        }),
        this.prisma.invoice.count({
          where: { schoolId, status: 'PENDING' },
        }),
        this.prisma.invoice.count({
          where: { schoolId, status: 'OVERDUE' },
        }),
      ])

    return {
      totalInvoiced: totalInvoiced._sum.amount ?? 0,
      totalPaid: totalPaid._sum.paidAmount ?? 0,
      totalRemaining: (totalInvoiced._sum.amount ?? 0) - (totalPaid._sum.paidAmount ?? 0),
      pendingInvoices,
      overdueInvoices,
    }
  }
  

  // ─── DONNÉES REÇU PDF ───────────────────────────────────────────────────────

  async getReceiptData(paymentId: string, schoolId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { id: paymentId, schoolId },
      select: {
        paymentNumber: true,
        amount: true,
        method: true,
        paidAt: true,
        invoice: {
          select: {
            invoiceNumber: true,
            feeConfig: {
              select: { name: true },
            },
          },
        },
      },
    })

    if (!payment) {
      throw new NotFoundException(`Paiement introuvable`)
    }

    // Récupérer le nom de l'école
    const school = await this.prisma.school.findFirst({
      where: { id: schoolId },
      select: { name: true },
    })

    // Récupérer le nom de l'élève via la facture
    const invoice = await this.prisma.invoice.findFirst({
      where: { invoiceNumber: payment.invoice.invoiceNumber },
    })

    const student = invoice
      ? await this.prisma.student.findFirst({
          where: { id: invoice.studentId },
          select: { firstName: true, lastName: true },
        })
      : null

    const methodLabels: Record<string, string> = {
      CASH: 'Espèces',
      BANK_TRANSFER: 'Virement bancaire',
      CHECK: 'Chèque',
      ONLINE: 'Paiement en ligne',
    }

    return {
      paymentNumber: payment.paymentNumber,
      invoiceNumber: payment.invoice.invoiceNumber,
      studentName: `${student?.firstName} ${student?.lastName}`,
      feeName: payment.invoice.feeConfig.name,
      amount: payment.amount,
      method: methodLabels[payment.method] ?? payment.method,
      paidAt: payment.paidAt,
      schoolName: school?.name ?? 'EduManager',
    }
  }

}