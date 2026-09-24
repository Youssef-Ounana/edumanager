'use client'

import { useState } from 'react'
import { useInvoices, useCreatePayment } from '@/hooks/usePayments'
import api from '@/lib/axios'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Download } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CreditCard, Search } from 'lucide-react'
import type { Invoice, InvoiceStatus } from '@/types'
import { CreateInvoiceModal } from '@/components/payments/CreateInvoiceModal'

const statusConfig: Record<InvoiceStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  PENDING: { label: 'En attente', variant: 'secondary' },
  PARTIAL: { label: 'Partiel', variant: 'outline' },
  PAID: { label: 'Payée', variant: 'default' },
  OVERDUE: { label: 'En retard', variant: 'destructive' },
  CANCELLED: { label: 'Annulée', variant: 'destructive' },
}

export default function PaymentsPage() {
  const [search, setSearch] = useState('')
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('CASH')

  const { data: invoices, isLoading } = useInvoices()
  const { mutate: createPayment, isPending } = useCreatePayment()

  const filtered = invoices?.filter((inv) =>
    inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
    inv.feeConfig.name.toLowerCase().includes(search.toLowerCase())
  )

  const formatAmount = (amount: number) =>
    new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
    }).format(amount)

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('fr-FR')

  const handlePayment = () => {
    if (!selectedInvoice || !paymentAmount) return

    createPayment(
      {
        invoiceId: selectedInvoice.id,
        amount: parseFloat(paymentAmount),
        method: paymentMethod,
      },
      {
        onSuccess: async () => {
          // Recharger la facture complète avec les paiements
          const response = await api.get(`/payments/invoices/${selectedInvoice.id}`)
          setSelectedInvoice(response.data)
          setPaymentAmount('')
        },
      }
    )
  }

  const downloadReceipt = async (paymentId: string, paymentNumber: string) => {
  try {
    const token = localStorage.getItem('accessToken')
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
    
    const response = await fetch(
      `${apiUrl}/payments/${paymentId}/receipt`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )

    if (!response.ok) throw new Error('Erreur téléchargement')

    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `recu-${paymentNumber}.pdf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Erreur téléchargement PDF:', error)
    alert('Erreur lors du téléchargement du reçu')
  }
}

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Paiements</h1>
          <p className="text-gray-500 mt-1">
            {invoices?.length ?? 0} factures au total
          </p>
        </div>
        <CreateInvoiceModal />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Liste des factures */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Rechercher une facture..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CreditCard className="w-5 h-5 text-blue-600" />
                Factures
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-gray-500">Chargement...</div>
              ) : filtered?.length === 0 ? (
                <div className="text-center py-8 text-gray-500">Aucune facture trouvée</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>N° Facture</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Reste</TableHead>
                      <TableHead>Échéance</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered?.map((invoice: Invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">
                          {invoice.invoiceNumber}
                        </TableCell>
                        <TableCell className="text-gray-500">
                          {invoice.feeConfig.name}
                        </TableCell>
                        <TableCell>{formatAmount(invoice.amount)}</TableCell>
                        <TableCell className="text-orange-600 font-medium">
                          {formatAmount(invoice.remainingAmount)}
                        </TableCell>
                        <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                        <TableCell>
                          <Badge variant={statusConfig[invoice.status].variant}>
                            {statusConfig[invoice.status].label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {invoice.status !== 'PAID' && invoice.status !== 'CANCELLED' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={async () => {
                                  const response = await api.get(`/payments/invoices/${invoice.id}`)
                                  setSelectedInvoice(response.data)
                                  setPaymentAmount(String(invoice.remainingAmount))
                                }}
                              >
                                Payer
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-blue-500"
                              onClick={async () => {
                                const response = await api.get(`/payments/invoices/${invoice.id}`)
                                setSelectedInvoice(response.data)
                                setPaymentAmount('')
                              }}
                            >
                              Détails
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Panel paiement */}
        <div>
          <Card className={selectedInvoice ? 'border-blue-200' : ''}>
            <CardHeader>
              <CardTitle className="text-base">
                {selectedInvoice ? 'Enregistrer un paiement' : 'Sélectionnez une facture'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedInvoice ? (
                <p className="text-sm text-gray-500">
                  Cliquez sur "Payer" pour une facture afin d'enregistrer un paiement.
                </p>
              ) : (
                <div className="space-y-4">
                  {/* Infos facture */}
                  <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                    <p className="text-sm font-medium">{selectedInvoice.invoiceNumber}</p>
                    <p className="text-sm text-gray-500">{selectedInvoice.feeConfig.name}</p>
                    <p className="text-lg font-bold text-orange-600">
                      Reste : {formatAmount(selectedInvoice.remainingAmount)}
                    </p>
                  </div>

                  {/* Formulaire paiement */}
                  {selectedInvoice.status !== 'PAID' && (
                    <>
                      <div className="space-y-2">
                        <Label>Montant payé (MAD)</Label>
                        <Input
                          type="number"
                          value={paymentAmount}
                          onChange={(e) => setPaymentAmount(e.target.value)}
                          min="1"
                          max={selectedInvoice.remainingAmount}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Méthode de paiement</Label>
                        <select
                          className="w-full border rounded-lg px-3 py-2 text-sm"
                          value={paymentMethod}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                        >
                          <option value="CASH">Espèces</option>
                          <option value="BANK_TRANSFER">Virement bancaire</option>
                          <option value="CHECK">Chèque</option>
                          <option value="ONLINE">Paiement en ligne</option>
                        </select>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          className="flex-1"
                          onClick={handlePayment}
                          disabled={isPending || !paymentAmount}
                        >
                          {isPending ? 'Enregistrement...' : 'Confirmer'}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setSelectedInvoice(null)}
                        >
                          Annuler
                        </Button>
                      </div>
                    </>
                  )}

                  {/* Historique paiements */}
                  {selectedInvoice.payments && selectedInvoice.payments.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">
                        Paiements effectués
                      </p>
                      {selectedInvoice.payments.map((payment) => (
                        <div
                          key={payment.id}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <p className="text-sm font-medium">{payment.paymentNumber}</p>
                            <p className="text-xs text-gray-500">{formatDate(payment.paidAt)}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">{formatAmount(payment.amount)}</p>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-blue-500 hover:text-blue-700"
                              onClick={() => downloadReceipt(payment.id, payment.paymentNumber)}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}