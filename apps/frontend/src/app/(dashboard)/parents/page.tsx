'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/axios'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Users, Search } from 'lucide-react'
import type { Parent } from '@/types'
import { CreateParentModal } from '@/components/parents/CreateParentModal'

export default function ParentsPage() {
  const [search, setSearch] = useState('')

  const { data: parents, isLoading } = useQuery({
    queryKey: ['parents'],
    queryFn: async () => {
      const response = await api.get<Parent[]>('/parents')
      return response.data
    },
  })

  const filtered = parents?.filter((p) =>
    `${p.user.firstName} ${p.user.lastName} ${p.user.email}`
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Parents</h1>
          <p className="text-gray-500 mt-1">
            {parents?.length ?? 0} parents enregistrés
          </p>
        </div>
        <CreateParentModal />
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Rechercher un parent..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="w-5 h-5 text-blue-600" />
            Liste des parents
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">
              Chargement...
            </div>
          ) : filtered?.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Aucun parent trouvé
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Profession</TableHead>
                  <TableHead>Enfants</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered?.map((parent: Parent) => (
                  <TableRow key={parent.id}>
                    <TableCell className="font-medium">
                      {parent.user.firstName} {parent.user.lastName}
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {parent.user.email}
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {parent.user.phone ?? '—'}
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {parent.occupation ?? '—'}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {parent.children.map((child, index) => (
                          <div key={index} className="text-sm">
                            <span className="font-medium">
                              {child.student.firstName} {child.student.lastName}
                            </span>
                            <span className="text-gray-400 ml-1">
                              ({child.relationship})
                            </span>
                          </div>
                        ))}
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