'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axios'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
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
import { Users } from 'lucide-react'
import type { Student } from '@/types'

const schema = z.object({
  firstName: z.string().min(2, 'Minimum 2 caractères'),
  lastName: z.string().min(2, 'Minimum 2 caractères'),
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Minimum 6 caractères'),
  phone: z.string().optional(),
  occupation: z.string().optional(),
  studentId: z.string().min(1, 'Élève obligatoire'),
  relationship: z.string().min(1, 'Relation obligatoire'),
})

type FormData = z.infer<typeof schema>

export function CreateParentModal() {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const { data: students } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const response = await api.get<Student[]>('/students')
      return response.data
    },
  })

  const { mutate: createParent, isPending } = useMutation({
    mutationFn: async (dto: FormData) => {
      const response = await api.post('/parents', dto)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parents'] })
      setOpen(false)
      reset()
    },
  })

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = (data: FormData) => {
    createParent(data)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button className="gap-2">
          <Users className="w-4 h-4" />
          Nouveau parent
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Ajouter un parent</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Prénom</Label>
              <Input placeholder="Karim" {...register('firstName')} />
              {errors.firstName && (
                <p className="text-xs text-red-500">{errors.firstName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Nom</Label>
              <Input placeholder="Benali" {...register('lastName')} />
              {errors.lastName && (
                <p className="text-xs text-red-500">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="karim@gmail.com"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Mot de passe</Label>
            <Input
              type="password"
              placeholder="••••••••"
              {...register('password')}
            />
            {errors.password && (
              <p className="text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Téléphone (optionnel)</Label>
              <Input placeholder="0612345678" {...register('phone')} />
            </div>
            <div className="space-y-2">
              <Label>Profession (optionnel)</Label>
              <Input placeholder="Ingénieur" {...register('occupation')} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Élève concerné</Label>
            <Select onValueChange={(val) => setValue('studentId', val as string)}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un élève..." />
              </SelectTrigger>
              <SelectContent>
                {students?.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.firstName} {student.lastName} — {student.registrationNr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.studentId && (
              <p className="text-xs text-red-500">{errors.studentId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Relation</Label>
            <Select onValueChange={(val) => setValue('relationship', val as string)}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Père">Père</SelectItem>
                <SelectItem value="Mère">Mère</SelectItem>
                <SelectItem value="Tuteur légal">Tuteur légal</SelectItem>
                <SelectItem value="Grand-père">Grand-père</SelectItem>
                <SelectItem value="Grand-mère">Grand-mère</SelectItem>
              </SelectContent>
            </Select>
            {errors.relationship && (
              <p className="text-xs text-red-500">{errors.relationship.message}</p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => { setOpen(false); reset() }}
            >
              Annuler
            </Button>
            <Button type="submit" className="flex-1" disabled={isPending}>
              {isPending ? 'Création...' : 'Créer parent'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}