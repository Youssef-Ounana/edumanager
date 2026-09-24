'use client'

import { useState } from 'react'
import { useStudents, useDeleteStudent } from '@/hooks/useStudents'
import { useInvoices } from '@/hooks/usePayments'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { GraduationCap, Search, Trash2 } from 'lucide-react'
import { CreateStudentModal } from '@/components/students/CreateStudentModal'
import { EditStudentModal } from '@/components/students/EditStudentModal'
import Link from 'next/link'
import type { Student } from '@/types'

function PaymentStatusBadge({ studentId }: { studentId: string }) {
  const { data: invoices } = useInvoices(studentId)

  if (!invoices || invoices.length === 0) {
    return <Badge variant="outline" className="text-xs">Aucune facture</Badge>
  }

  const hasOverdue = invoices.some((inv) => inv.status === 'OVERDUE')
  const hasPending = invoices.some((inv) => inv.status === 'PENDING' || inv.status === 'PARTIAL')
  const allPaid = invoices.every((inv) => inv.status === 'PAID' || inv.status === 'CANCELLED')

  const totalRemaining = invoices.reduce((sum, inv) => sum + inv.remainingAmount, 0)

  if (hasOverdue) {
    return (
      <div className="flex flex-col gap-1">
        <Badge variant="destructive" className="text-xs">🔴 En retard</Badge>
        <span className="text-xs text-red-500">{new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' }).format(totalRemaining)}</span>
      </div>
    )
  }

  if (allPaid) {
    return <Badge className="text-xs bg-green-100 text-green-700">✅ À jour</Badge>
  }

  if (hasPending) {
    return (
      <div className="flex flex-col gap-1">
        <Badge variant="secondary" className="text-xs">🟡 En attente</Badge>
        <span className="text-xs text-orange-500">{new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' }).format(totalRemaining)}</span>
      </div>
    )
  }

  return <Badge variant="outline" className="text-xs">—</Badge>
}

export default function StudentsPage() {
  const [search, setSearch] = useState('')
  const { data: students, isLoading } = useStudents()
  const { mutate: deleteStudent } = useDeleteStudent()

  const filtered = students?.filter((s) =>
    `${s.firstName} ${s.lastName} ${s.registrationNr}`
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('fr-FR')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Élèves</h1>
          <p className="text-gray-500 mt-1">
            {students?.length ?? 0} élèves inscrits
          </p>
        </div>
        <CreateStudentModal />
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Rechercher un élève..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <GraduationCap className="w-5 h-5 text-blue-600" />
            Liste des élèves
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Chargement...</div>
          ) : filtered?.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Aucun élève trouvé</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>N° Inscription</TableHead>
                  <TableHead>Genre</TableHead>
                  <TableHead>Date de naissance</TableHead>
                  <TableHead>Classe</TableHead>
                  <TableHead>Parent</TableHead>
                  <TableHead>Paiement</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered?.map((student: Student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <Link
                        href={`/students/${student.id}`}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {student.firstName} {student.lastName}
                      </Link>
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {student.registrationNr}
                    </TableCell>
                    <TableCell>
                      <Badge variant={student.gender === 'MALE' ? 'default' : 'secondary'}>
                        {student.gender === 'MALE' ? 'Garçon' : 'Fille'}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(student.dateOfBirth)}</TableCell>
                    <TableCell>
                      {student.enrollments?.[0]?.classroom?.name ?? (
                        <span className="text-gray-400 text-sm">Non affecté</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {(student as any).parents?.[0] ? (
                        <div>
                          <p className="text-sm font-medium">
                            {(student as any).parents[0].parent.user.firstName}{' '}
                            {(student as any).parents[0].parent.user.lastName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(student as any).parents[0].parent.user.phone ?? '—'}
                          </p>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <PaymentStatusBadge studentId={student.id} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <EditStudentModal student={student} />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => {
                            if (confirm('Supprimer cet élève ?')) {
                              deleteStudent(student.id)
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
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
  )
}