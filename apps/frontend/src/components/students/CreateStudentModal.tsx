'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateStudent } from '@/hooks/useStudents'
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
import { Plus, GraduationCap, Users } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

const schema = z.object({
  firstName: z.string().min(2, 'Minimum 2 caractères'),
  lastName: z.string().min(2, 'Minimum 2 caractères'),
  dateOfBirth: z.string().min(1, 'Date obligatoire'),
  gender: z.enum(['MALE', 'FEMALE'], { required_error: 'Genre obligatoire' }),
  registrationNr: z.string().min(1, 'Numéro obligatoire'),
  phone: z.string().optional(),
  address: z.string().optional(),
  parent: z.object({
    firstName: z.string().min(2, 'Minimum 2 caractères'),
    lastName: z.string().min(2, 'Minimum 2 caractères'),
    email: z.string().email('Email invalide'),
    password: z.string().min(6, 'Minimum 6 caractères'),
    phone: z.string().optional(),
    occupation: z.string().optional(),
    relationship: z.string().min(1, 'Relation obligatoire'),
  }),
})

type FormData = z.infer<typeof schema>

export function CreateStudentModal() {
  const [open, setOpen] = useState(false)
  const { mutate: createStudent, isPending } = useCreateStudent()

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
    createStudent(data, {
      onSuccess: () => {
        setOpen(false)
        reset()
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Nouvel élève
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajouter un élève</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">

          {/* ── Section élève ── */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-blue-600" />
              <h3 className="font-medium text-sm">Informations élève</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Prénom</Label>
                <Input placeholder="Ahmed" {...register('firstName')} />
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
                <Select onValueChange={(val) => setValue('gender', val as 'MALE' | 'FEMALE')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">Garçon</SelectItem>
                    <SelectItem value="FEMALE">Fille</SelectItem>
                  </SelectContent>
                </Select>
                {errors.gender && (
                  <p className="text-xs text-red-500">{errors.gender.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>N° d'inscription</Label>
                <Input placeholder="2026-001" {...register('registrationNr')} />
                {errors.registrationNr && (
                  <p className="text-xs text-red-500">{errors.registrationNr.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Téléphone (optionnel)</Label>
                <Input placeholder="0612345678" {...register('phone')} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Adresse (optionnel)</Label>
              <Input placeholder="123 rue..." {...register('address')} />
            </div>
          </div>

          <Separator />

          {/* ── Section parent ── */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-green-600" />
              <h3 className="font-medium text-sm">Parent / Contact d'urgence</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Prénom</Label>
                <Input placeholder="Karim" {...register('parent.firstName')} />
                {errors.parent?.firstName && (
                  <p className="text-xs text-red-500">{errors.parent.firstName.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Nom</Label>
                <Input placeholder="Benali" {...register('parent.lastName')} />
                {errors.parent?.lastName && (
                  <p className="text-xs text-red-500">{errors.parent.lastName.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="karim@gmail.com"
                  {...register('parent.email')}
                />
                {errors.parent?.email && (
                  <p className="text-xs text-red-500">{errors.parent.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Mot de passe</Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  {...register('parent.password')}
                />
                {errors.parent?.password && (
                  <p className="text-xs text-red-500">{errors.parent.password.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Téléphone</Label>
                <Input placeholder="0612345678" {...register('parent.phone')} />
              </div>
              <div className="space-y-2">
                <Label>Profession (optionnel)</Label>
                <Input placeholder="Ingénieur" {...register('parent.occupation')} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Relation avec l'élève</Label>
              <Select onValueChange={(val) => setValue('parent.relationship', val)}>
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
              {errors.parent?.relationship && (
                <p className="text-xs text-red-500">{errors.parent.relationship.message}</p>
              )}
            </div>
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
              {isPending ? 'Création...' : 'Créer élève + parent'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}