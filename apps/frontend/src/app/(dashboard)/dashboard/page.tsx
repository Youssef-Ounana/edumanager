'use client'

import { useAuthStore } from '@/lib/store'
import { useStudents } from '@/hooks/useStudents'
import { useFinancialSummary } from '@/hooks/usePayments'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  GraduationCap,
  CreditCard,
  AlertCircle,
  TrendingUp,
} from 'lucide-react'

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { data: students } = useStudents()
  const { data: summary } = useFinancialSummary()

  const formatAmount = (amount: number) =>
    new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
    }).format(amount)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Bonjour, {user?.firstName} 👋
        </h1>
        <p className="text-gray-500 mt-1">
          Voici un aperçu de votre établissement
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total élèves
            </CardTitle>
            <GraduationCap className="w-5 h-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{students?.length ?? 0}</p>
            <p className="text-xs text-gray-500 mt-1">élèves inscrits</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total facturé
            </CardTitle>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {formatAmount(summary?.totalInvoiced ?? 0)}
            </p>
            <p className="text-xs text-gray-500 mt-1">cette année</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total encaissé
            </CardTitle>
            <CreditCard className="w-5 h-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              {formatAmount(summary?.totalPaid ?? 0)}
            </p>
            <p className="text-xs text-gray-500 mt-1">paiements reçus</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Impayés
            </CardTitle>
            <AlertCircle className="w-5 h-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-500">
              {summary?.pendingInvoices ?? 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">factures en attente</p>
          </CardContent>
        </Card>
      </div>

      {/* Remaining amount */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="text-base text-orange-800">
            Montant restant à encaisser
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold text-orange-600">
            {formatAmount(summary?.totalRemaining ?? 0)}
          </p>
          <p className="text-sm text-orange-700 mt-2">
            {summary?.overdueInvoices ?? 0} factures en retard
          </p>
        </CardContent>
      </Card>
    </div>
  )
}