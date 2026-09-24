'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { useStudent } from '@/hooks/useStudents'
import { useInvoices } from '@/hooks/usePayments'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ArrowLeft,
  GraduationCap,
  Users,
  CreditCard,
  Phone,
  Mail,
  MapPin,
  Calendar,
} from 'lucide-react'
import type { InvoiceStatus } from '@/types'

const statusConfig: Record<InvoiceStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  PENDING: { label: 'En attente', variant: 'secondary' },
  PARTIAL: { label: 'Partiel', variant: 'outline' },
  PAID: { label: 'Payée', variant: 'default' },
  OVERDUE: { label: 'En retard', variant: 'destructive' },
  CANCELLED: { label: 'Annulée', variant: 'destructive' },
}

export default function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const { data: student, isLoading } = useStudent(id)
  const { data: invoices } = useInvoices(id)

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('fr-FR')

  const formatAmount = (amount: number) =>
    new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
    }).format(amount)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Chargement...</p>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Élève introuvable</p>
      </div>
    )
  }

  const totalDue = invoices?.reduce((sum, inv) => sum + inv.remainingAmount, 0) ?? 0
  const totalPaid = invoices?.reduce((sum, inv) => sum + inv.paidAmount, 0) ?? 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {student.firstName} {student.lastName}
          </h1>
          <p className="text-gray-500 text-sm">
            N° {student.registrationNr}
          </p>
        </div>
        <Badge variant={student.gender === 'MALE' ? 'default' : 'secondary'} className="ml-auto">
          {student.gender === 'MALE' ? 'Garçon' : 'Fille'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne gauche */}
        <div className="space-y-6">
          {/* Infos personnelles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                Informations personnelles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Date de naissance</p>
                  <p className="text-sm font-medium">{formatDate(student.dateOfBirth)}</p>
                </div>
              </div>

              {student.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Téléphone</p>
                    <p className="text-sm font-medium">{student.phone}</p>
                  </div>
                </div>
              )}

              {student.address && (
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Adresse</p>
                    <p className="text-sm font-medium">{student.address}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Inscrit le</p>
                  <p className="text-sm font-medium">{formatDate(student.createdAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Classes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Historique des classes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {student.enrollments && student.enrollments.length > 0 ? (
                student.enrollments.map((enrollment: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium">{enrollment.classroom.name}</p>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">{enrollment.classroom.schoolYear.name}</p>
                      {enrollment.classroom.schoolYear.isCurrent && (
                        <Badge className="text-xs">Actuelle</Badge>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-2">
                  Aucune classe assignée
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Colonne droite */}
        <div className="lg:col-span-2 space-y-6">
          {/* Parents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="w-5 h-5 text-green-600" />
                Parents / Contacts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {student.parents && student.parents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {student.parents.map((sp: any, index: number) => (
                    <div key={index} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">
                          {sp.parent.user.firstName} {sp.parent.user.lastName}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {sp.relationship}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Mail className="w-3 h-3" />
                          {sp.parent.user.email}
                        </div>
                        {sp.parent.user.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Phone className="w-3 h-3" />
                            {sp.parent.user.phone}
                          </div>
                        )}
                        {sp.parent.occupation && (
                          <p className="text-xs text-gray-400">{sp.parent.occupation}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  Aucun parent enregistré
                </p>
              )}
            </CardContent>
          </Card>

          {/* Paiements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CreditCard className="w-5 h-5 text-blue-600" />
                Situation financière
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Résumé */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-green-600">Total payé</p>
                  <p className="text-lg font-bold text-green-700">
                    {formatAmount(totalPaid)}
                  </p>
                </div>
                <div className="bg-red-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-red-600">Reste à payer</p>
                  <p className="text-lg font-bold text-red-700">
                    {formatAmount(totalDue)}
                  </p>
                </div>
              </div>

              {/* Factures */}
              {invoices && invoices.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Facture</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="text-sm">
                          {invoice.invoiceNumber}
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {invoice.feeConfig.name}
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatAmount(invoice.amount)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusConfig[invoice.status].variant}>
                            {statusConfig[invoice.status].label}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  Aucune facture
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}