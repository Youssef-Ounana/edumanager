'use client'

import { useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import api from '@/lib/axios'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { School, Save } from 'lucide-react'
import type { School as SchoolType } from '@/types'

const schema = z.object({
  name: z.string().min(3, 'Minimum 3 caractères'),
  email: z.string().email('Email invalide'),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  level: z.string().optional(),
  maxStudents: z.coerce.number().min(10).max(10000).optional(),
})

type FormData = z.infer<typeof schema>

const levelLabels: Record<string, string> = {
  PRIMARY: 'Primaire',
  MIDDLE: 'Collège',
  HIGH: 'Lycée',
  MIXED: 'Mixte (plusieurs niveaux)',
}

export function SchoolSettings() {
  const { data: schools } = useQuery({
    queryKey: ['schools'],
    queryFn: async () => {
      const response = await api.get<SchoolType[]>('/schools')
      return response.data
    },
  })

  const school = schools?.[0]

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (school) {
      reset({
        name: school.name,
        email: school.email,
        phone: school.phone ?? '',
        address: school.address ?? '',
        city: school.city ?? '',
        country: school.country ?? 'MA',
        level: school.level,
        maxStudents: school.maxStudents,
      })
    }
  }, [school, reset])

  const { mutate: updateSchool, isPending } = useMutation({
    mutationFn: async (dto: FormData) => {
      const response = await api.put(`/schools/${school?.id}`, dto)
      return response.data
    },
    onSuccess: () => {
      alert('Informations mises à jour avec succès !')
    },
  })

  if (!school) {
    return (
      <Card className="max-w-lg">
        <CardContent className="py-8 text-center text-gray-500">
          Chargement...
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <School className="w-4 h-4 text-blue-600" />
          Informations de l'établissement
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit((data) => updateSchool(data))}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label>Nom de l'établissement</Label>
            <Input placeholder="Mon École" {...register('name')} />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="contact@ecole.ma"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Téléphone</Label>
              <Input placeholder="0522000000" {...register('phone')} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Ville</Label>
              <Input placeholder="Casablanca" {...register('city')} />
            </div>
            <div className="space-y-2">
              <Label>Pays</Label>
              <Input placeholder="MA" {...register('country')} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Adresse</Label>
            <Input placeholder="123 rue..." {...register('address')} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Niveau</Label>
              <Select
                defaultValue={school.level}
                onValueChange={(val) => setValue('level', val as string)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(levelLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Capacité max élèves</Label>
              <Input
                type="number"
                min="10"
                max="10000"
                {...register('maxStudents')}
              />
            </div>
          </div>

          {/* Infos non modifiables */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <p className="text-sm font-medium text-gray-700">
              Informations système
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
              <div>
                <p className="font-medium">Slug</p>
                <p>{school.slug}</p>
              </div>
              <div>
                <p className="font-medium">Statut</p>
                <p>{school.status}</p>
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full gap-2" disabled={isPending}>
            <Save className="w-4 h-4" />
            {isPending ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}