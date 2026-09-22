import { Injectable } from '@nestjs/common'
import PDFDocument = require('pdfkit')

@Injectable()
export class PdfService {
  async generateReceipt(data: {
    paymentNumber: string
    invoiceNumber: string
    studentName: string
    feeName: string
    amount: number
    method: string
    paidAt: Date
    schoolName: string
  }): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        margin: 50,
        size: 'A4',
        bufferPages: true,
      })

      const chunks: Buffer[] = []

      doc.on('data', (chunk: Buffer) => chunks.push(chunk))
      doc.on('end', () => resolve(Buffer.concat(chunks)))
      doc.on('error', (err: Error) => reject(err))

      const formatAmount = (amount: number) =>
        new Intl.NumberFormat('fr-MA', {
          style: 'currency',
          currency: 'MAD',
        }).format(amount)

      const formatDate = (date: Date) =>
        new Date(date).toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        })

      // ── En-tête ──
      doc
        .fontSize(22)
        .font('Helvetica-Bold')
        .text(data.schoolName, { align: 'center' })

      doc.moveDown(0.5)

      doc
        .fontSize(14)
        .font('Helvetica')
        .fillColor('#666666')
        .text('REÇU DE PAIEMENT', { align: 'center' })

      doc.moveDown(1)
      doc.fillColor('#000000')

      // ── Ligne de séparation ──
      doc
        .moveTo(50, doc.y)
        .lineTo(545, doc.y)
        .lineWidth(2)
        .stroke('#2563EB')

      doc.moveDown(1)

      // ── Informations ──
      const addRow = (label: string, value: string) => {
        const y = doc.y
        doc
          .fontSize(11)
          .font('Helvetica-Bold')
          .fillColor('#374151')
          .text(label, 50, y, { width: 180 })

        doc
          .fontSize(11)
          .font('Helvetica')
          .fillColor('#000000')
          .text(value, 230, y)

        doc.moveDown(0.8)
      }

      addRow('N° Reçu :', data.paymentNumber)
      addRow('N° Facture :', data.invoiceNumber)
      addRow('Élève :', data.studentName)
      addRow('Objet :', data.feeName)
      addRow('Date de paiement :', formatDate(new Date(data.paidAt)))
      addRow('Méthode :', data.method)

      doc.moveDown(1)

      // ── Ligne de séparation ──
      doc
        .moveTo(50, doc.y)
        .lineTo(545, doc.y)
        .lineWidth(1)
        .stroke('#E5E7EB')

      doc.moveDown(1)

      // ── Montant ──
      doc
        .fontSize(13)
        .font('Helvetica-Bold')
        .fillColor('#374151')
        .text('Montant payé :', { align: 'center' })

      doc.moveDown(0.5)

      doc
        .fontSize(28)
        .font('Helvetica-Bold')
        .fillColor('#2563EB')
        .text(formatAmount(data.amount), { align: 'center' })

      doc.moveDown(2)

      // ── Ligne de séparation ──
      doc
        .moveTo(50, doc.y)
        .lineTo(545, doc.y)
        .lineWidth(1)
        .stroke('#E5E7EB')

      doc.moveDown(1)

      // ── Pied de page ──
      doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor('#9CA3AF')
        .text(
          `Document généré automatiquement par Tinmel le ${formatDate(new Date())}`,
          { align: 'center' }
        )

      doc.end()
    })
  }
}