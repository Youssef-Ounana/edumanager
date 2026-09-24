'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useUpdateStudent } from '@/hooks/useStudents'
import api from '@/lib/axios'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Pencil, GraduationCap, Users, CalendarDays } from 'lucide-react'
import type { Student, Classroom, SchoolYear } from '@/types'

const schema = z.object({
  firstName: z.string().min(2, 'Minimum 2 caractères'),
  lastName: z.string().min(2, 'Minimum 2 caractères'),
  dateOfBirth: z.string().min(1, 'Date obligatoire'),
  gender: z.enum(['MALE', 'FEMALE']),
  phone: z.string().optional(),
  address: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  student: Student
}

export function EditStudentModal({ student }: Props) {
  const [open, setOpen] = useState(false)
  const [selectedYearId, setSelectedYearId] = useState('')
  const [selectedClassroomId, setSelectedClassroomId] = useState('')
  const queryClient = useQueryClient()
  const { mutate: updateStudent, isPending } = useUpdateStudent(student.id)

  const { register, handleSubmit, setValue, reset, formState: { errors } } =
    useForm<FormData>({ resolver: zodResolver(schema) })

  // Années scolaires
  const { data: schoolYears } = useQuery({
    queryKey: ['school-years'],
    queryFn: async () => {
      const response = await api.get<SchoolYear[]>('/school-years')
      return response.data
    },
    enabled: open,
  })

  // Classes de l'année sélectionnée
  const { data: classrooms } = useQuery({
    queryKey: ['classrooms', selectedYearId],
    queryFn: async () => {
      const response = await api.get<Classroom[]>(
        `/school-years/${selectedYearId}/classrooms`
      )
      return response.data
    },
    enabled: !!selectedYearId,
  })

  // Inscrire l'élève dans une classe
  const { mutate: enrollStudent, isPending: enrolling } = useMutation({
    mutationFn: async () => {
      const response = await api.post('/school-years/enroll', {
        studentId: student.id,
        classroomId: selectedClassroomId,
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] })
      setSelectedClassroomId('')
      setSelectedYearId('')
    },
  })

  useEffect(() => {
    if (open) {
      reset({
        firstName: student.firstName,
        lastName: student.lastName,
        dateOfBirth: student.dateOfBirth.split('T')[0],
        gender: student.gender,
        phone: student.phone ?? '',
        address: student.address ?? '',
      })
    }
  }, [open, student, reset])

  const onSubmit = (data: FormData) => {
    updateStudent(data, {
      onSuccess: () => setOpen(false),
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger >
        <Button variant="ghost" size="sm" className="text-blue-500 hover:text-blue-700 hover:bg-blue-50">
          <Pencil className="w-4 h-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {student.firstName} {student.lastName}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="info" className="mt-4">
          <TabsList className="w-full">
            <TabsTrigger value="info" className="flex-1 gap-2">
              <GraduationCap className="w-4 h-4" />
              Infos
            </TabsTrigger>
            <TabsTrigger value="classe" className="flex-1 gap-2">
              <CalendarDays className="w-4 h-4" />
              Classe
            </TabsTrigger>
            <TabsTrigger value="parents" className="flex-1 gap-2">
              <Users className="w-4 h-4" />
              Parents
            </TabsTrigger>
          </TabsList>

          {/* ── Onglet Infos ── */}
          <TabsContent value="info">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Prénom</Label>
                  <Input {...register('firstName')} />
                  {errors.firstName && (
                    <p className="text-xs text-red-500">{errors.firstName.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Nom</Label>
                  <Input {...register('lastName')} />
                  {errors.lastName && (
                    <p className="text-xs text-red-500">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date de naissance</Label>
                  <Input type="date" {...register('dateOfBirth')} />
                  {errors.dateOfBirth && (
                    <p className="text-xs text-red-500">{errors.dateOfBirth.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Genre</Label>
                  <Select
                    defaultValue={student.gender}
                    onValueChange={(val) => setValue('gender', val as 'MALE' | 'FEMALE')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Garçon</SelectItem>
                      <SelectItem value="FEMALE">Fille</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Téléphone</Label>
                  <Input placeholder="0612345678" {...register('phone')} />
                </div>
                <div className="space-y-2">
                  <Label>Adresse</Label>
                  <Input placeholder="123 rue..." {...register('address')} />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" className="flex-1" disabled={isPending}>
                  {isPending ? 'Modification...' : 'Enregistrer'}
                </Button>
              </div>
            </form>
          </TabsContent>

          {/* ── Onglet Classe ── */}
          <TabsContent value="classe">
            <div className="space-y-4 mt-4">

              {/* Classe actuelle */}
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm font-medium text-gray-700">Classe actuelle</p>
                <p className="text-sm text-gray-500 mt-1">
                  {student.enrollments?.[0]?.classroom?.name ?? 'Non affecté'}
                </p>
              </div>

              {/* Affecter à une nouvelle classe */}
              <div className="space-y-3">
                <p className="text-sm font-medium">Affecter à une classe</p>

                <div className="space-y-2">
                  <Label>Année scolaire</Label>
                  <Select onValueChange={(val) => {
                    setSelectedYearId(val)
                    setSelectedClassroomId('')
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une année..." />
                    </SelectTrigger>
                    <SelectContent>
                      {schoolYears?.map((year) => (
                        <SelectItem key={year.id} value={year.id}>
                          {year.name} {year.isCurrent ? '⭐' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedYearId && (
                  <div className="space-y-2">
                    <Label>Classe</Label>
                    <Select onValueChange={setSelectedClassroomId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une classe..." />
                      </SelectTrigger>
                      <SelectContent>
                        {classrooms?.length === 0 ? (
                          <SelectItem value="none" disabled>
                            Aucune classe disponible
                          </SelectItem>
                        ) : (
                          classrooms?.map((classroom) => (
                            <SelectItem key={classroom.id} value={classroom.id}>
                              {classroom.name} ({classroom._count?.enrollments ?? 0}/{classroom.capacity} élèves)
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <Button
                  className="w-full"
                  disabled={!selectedClassroomId || enrolling}
                  onClick={() => enrollStudent()}
                >
                  {enrolling ? 'Affectation...' : 'Affecter à cette classe'}
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* ── Onglet Parents ── */}
          <TabsContent value="parents">
            <div className="space-y-3 mt-4">
              {student.parents && student.parents.length > 0 ? (
                student.parents.map((sp: any, index: number) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">
                        {sp.parent.user.firstName} {sp.parent.user.lastName}
                      </p>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                        {sp.relationship}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{sp.parent.user.email}</p>
                    <p className="text-sm text-gray-500">{sp.parent.user.phone ?? '—'}</p>
                    {sp.parent.occupation && (
                      <p className="text-xs text-gray-400">{sp.parent.occupation}</p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4 text-sm">
                  Aucun parent enregistré
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}