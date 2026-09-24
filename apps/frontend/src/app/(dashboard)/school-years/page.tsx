'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axios'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { CalendarDays, Plus, Star } from 'lucide-react'
import type { SchoolYear, Classroom } from '@/types'

export default function SchoolYearsPage() {
  const queryClient = useQueryClient()
  const [selectedYear, setSelectedYear] = useState<SchoolYear | null>(null)
  const [newYearForm, setNewYearForm] = useState({
    name: '', startDate: '', endDate: '', isCurrent: false,
  })
  const [newClassForm, setNewClassForm] = useState({
    name: '', capacity: 30,
  })

  const { data: schoolYears, isLoading } = useQuery({
    queryKey: ['school-years'],
    queryFn: async () => {
      const response = await api.get<SchoolYear[]>('/school-years')
      return response.data
    },
  })

  const { data: classrooms } = useQuery({
    queryKey: ['classrooms', selectedYear?.id],
    queryFn: async () => {
      const response = await api.get<Classroom[]>(
        `/school-years/${selectedYear?.id}/classrooms`
      )
      return response.data
    },
    enabled: !!selectedYear,
  })

  const { mutate: createYear, isPending: creatingYear } = useMutation({
    mutationFn: async (dto: typeof newYearForm) => {
      const response = await api.post('/school-years', dto)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-years'] })
      setNewYearForm({ name: '', startDate: '', endDate: '', isCurrent: false })
    },
  })

  const { mutate: createClassroom, isPending: creatingClass } = useMutation({
    mutationFn: async (dto: { name: string; capacity: number; schoolYearId: string }) => {
      const response = await api.post('/school-years/classrooms', dto)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classrooms', selectedYear?.id] })
      setNewClassForm({ name: '', capacity: 30 })
    },
  })

  const { mutate: setCurrent } = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.patch(`/school-years/${id}/set-current`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-years'] })
    },
  })

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('fr-FR')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Années scolaires</h1>
        <p className="text-gray-500 mt-1">Gérez les années et les classes</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Années scolaires */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CalendarDays className="w-5 h-5 text-blue-600" />
                Années scolaires
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Formulaire création */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <p className="text-sm font-medium">Nouvelle année</p>
                <Input
                  placeholder="Ex: 2027-2028"
                  value={newYearForm.name}
                  onChange={(e) => setNewYearForm({ ...newYearForm, name: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Début</Label>
                    <Input
                      type="date"
                      value={newYearForm.startDate}
                      onChange={(e) => setNewYearForm({ ...newYearForm, startDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Fin</Label>
                    <Input
                      type="date"
                      value={newYearForm.endDate}
                      onChange={(e) => setNewYearForm({ ...newYearForm, endDate: e.target.value })}
                    />
                  </div>
                </div>
                <Button
                  size="sm"
                  className="w-full gap-2"
                  onClick={() => createYear(newYearForm)}
                  disabled={creatingYear || !newYearForm.name}
                >
                  <Plus className="w-4 h-4" />
                  {creatingYear ? 'Création...' : 'Créer'}
                </Button>
              </div>

              {/* Liste */}
              {isLoading ? (
                <p className="text-center text-gray-500 py-4">Chargement...</p>
              ) : (
                <div className="space-y-2">
                  {schoolYears?.map((year) => (
                    <div
                      key={year.id}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedYear?.id === year.id
                          ? 'border-blue-300 bg-blue-50'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedYear(year)}
                    >
                      <div>
                        <p className="font-medium text-sm">{year.name}</p>
                        <p className="text-xs text-gray-500">
                          {formatDate(year.startDate)} → {formatDate(year.endDate)}
                        </p>
                        <p className="text-xs text-gray-400">
                          {year._count?.classrooms ?? 0} classes
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {year.isCurrent ? (
                          <Badge className="gap-1">
                            <Star className="w-3 h-3" />
                            Courante
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation()
                              setCurrent(year.id)
                            }}
                          >
                            Définir courante
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Classes */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {selectedYear
                  ? `Classes — ${selectedYear.name}`
                  : 'Sélectionnez une année'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!selectedYear ? (
                <p className="text-sm text-gray-500">
                  Cliquez sur une année scolaire pour voir et gérer ses classes.
                </p>
              ) : (
                <>
                  {/* Formulaire classe */}
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <p className="text-sm font-medium">Nouvelle classe</p>
                    <Input
                      placeholder="Ex: 6ème B"
                      value={newClassForm.name}
                      onChange={(e) => setNewClassForm({ ...newClassForm, name: e.target.value })}
                    />
                    <div>
                      <Label className="text-xs">Capacité</Label>
                      <Input
                        type="number"
                        value={newClassForm.capacity}
                        onChange={(e) => setNewClassForm({ ...newClassForm, capacity: parseInt(e.target.value) })}
                      />
                    </div>
                    <Button
                      size="sm"
                      className="w-full gap-2"
                      onClick={() => createClassroom({
                        ...newClassForm,
                        schoolYearId: selectedYear.id,
                      })}
                      disabled={creatingClass || !newClassForm.name}
                    >
                      <Plus className="w-4 h-4" />
                      {creatingClass ? 'Création...' : 'Créer la classe'}
                    </Button>
                  </div>

                  {/* Liste classes */}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Classe</TableHead>
                        <TableHead>Capacité</TableHead>
                        <TableHead>Élèves</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {classrooms?.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center text-gray-500">
                            Aucune classe créée
                          </TableCell>
                        </TableRow>
                      ) : (
                        classrooms?.map((classroom) => (
                          <TableRow key={classroom.id}>
                            <TableCell className="font-medium">
                              {classroom.name}
                            </TableCell>
                            <TableCell>{classroom.capacity}</TableCell>
                            <TableCell>
                              {classroom._count?.enrollments ?? 0}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}