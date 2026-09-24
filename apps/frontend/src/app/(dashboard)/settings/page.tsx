'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import api from '@/lib/axios'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { SchoolSettings } from '@/components/settings/SchoolSettings'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Settings,
  Plus,
  Trash2,
  CreditCard,
  School,
  Users,
} from 'lucide-react'
import type { FeeConfig, SchoolYear } from '@/types'

// ─── Schémas de validation ───────────────────────────────────────────────────

const feeSchema = z.object({
  name: z.string().min(3, 'Minimum 3 caractères'),
  type: z.string().min(1, 'Type obligatoire'),
  amount: z.coerce.number().min(1, 'Montant minimum 1'),
  dueDay: z.coerce.number().min(1).max(31).optional(),
  description: z.string().optional(),
  schoolYearId: z.string().min(1, 'Année scolaire obligatoire'),
})

const userSchema = z.object({
  firstName: z.string().min(2, 'Minimum 2 caractères'),
  lastName: z.string().min(2, 'Minimum 2 caractères'),
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Minimum 6 caractères'),
  role: z.string().min(1, 'Rôle obligatoire'),
})

type FeeForm = z.infer<typeof feeSchema>
type UserForm = z.infer<typeof userSchema>

// ─── Labels ──────────────────────────────────────────────────────────────────

const feeTypeLabels: Record<string, string> = {
  REGISTRATION: 'Inscription',
  MONTHLY: 'Mensuel',
  EXAM: 'Examen',
  TRANSPORT: 'Transport',
  CANTEEN: 'Cantine',
  OTHER: 'Autre',
}

const roleLabels: Record<string, string> = {
  SECRETARY: 'Secrétaire',
  ACCOUNTANT: 'Comptable',
  TEACHER: 'Enseignant',
}

// ─── Page principale ─────────────────────────────────────────────────────────

export default function SettingsPage() {
  const queryClient = useQueryClient()
  const [feeYearId, setFeeYearId] = useState('')

  // ── Données ──
  const { data: schoolYears } = useQuery({
    queryKey: ['school-years'],
    queryFn: async () => {
      const response = await api.get<SchoolYear[]>('/school-years')
      return response.data
    },
  })

  const { data: feeConfigs, isLoading: loadingFees } = useQuery({
    queryKey: ['fee-configs', feeYearId],
    queryFn: async () => {
      const params = feeYearId ? `?schoolYearId=${feeYearId}` : ''
      const response = await api.get<FeeConfig[]>(`/payments/fee-configs${params}`)
      return response.data
    },
  })

  // ── Formulaire frais ──
  const {
    register: registerFee,
    handleSubmit: handleFeeSubmit,
    setValue: setFeeValue,
    reset: resetFee,
    formState: { errors: feeErrors },
  } = useForm<FeeForm>({ resolver: zodResolver(feeSchema) })

  const { mutate: createFee, isPending: creatingFee } = useMutation({
    mutationFn: async (dto: FeeForm) => {
      const response = await api.post('/payments/fee-configs', dto)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-configs'] })
      resetFee()
    },
  })

  const { mutate: deleteFee } = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/payments/fee-configs/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-configs'] })
    },
  })

  // ── Formulaire utilisateur ──
  const {
    register: registerUser,
    handleSubmit: handleUserSubmit,
    setValue: setUserValue,
    reset: resetUser,
    formState: { errors: userErrors },
  } = useForm<UserForm>({ resolver: zodResolver(userSchema) })

  const { mutate: createUser, isPending: creatingUser } = useMutation({
    mutationFn: async (dto: UserForm) => {
      const response = await api.post('/auth/register', dto)
      return response.data
    },
    onSuccess: () => {
      resetUser()
      alert('Utilisateur créé avec succès !')
    },
  })

  const formatAmount = (amount: number) =>
    new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
    }).format(amount)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Settings className="w-6 h-6" />
          Paramètres
        </h1>
        <p className="text-gray-500 mt-1">
          Configurez votre établissement
        </p>
      </div>

      <Tabs defaultValue="fees">
        <TabsList className="w-full">
          <TabsTrigger value="fees" className="flex-1 gap-2">
            <CreditCard className="w-4 h-4" />
            Frais scolaires
          </TabsTrigger>
          <TabsTrigger value="users" className="flex-1 gap-2">
            <Users className="w-4 h-4" />
            Utilisateurs
          </TabsTrigger>
          <TabsTrigger value="school" className="flex-1 gap-2">
            <School className="w-4 h-4" />
            École
          </TabsTrigger>
        </TabsList>

        {/* ── Onglet Frais ── */}
        <TabsContent value="fees" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Formulaire création frais */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Plus className="w-4 h-4 text-blue-600" />
                  Nouveau type de frais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={handleFeeSubmit((data) => createFee(data))}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label>Nom</Label>
                    <Input
                      placeholder="Ex: Frais de scolarité mensuel"
                      {...registerFee('name')}
                    />
                    {feeErrors.name && (
                      <p className="text-xs text-red-500">{feeErrors.name.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select onValueChange={(val) => setFeeValue('type', val as string)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner..." />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(feeTypeLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {feeErrors.type && (
                        <p className="text-xs text-red-500">{feeErrors.type.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Montant (MAD)</Label>
                      <Input
                        type="number"
                        placeholder="500"
                        {...registerFee('amount')}
                      />
                      {feeErrors.amount && (
                        <p className="text-xs text-red-500">{feeErrors.amount.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Jour d'échéance (optionnel)</Label>
                      <Input
                        type="number"
                        placeholder="5"
                        min="1"
                        max="31"
                        {...registerFee('dueDay')}
                      />
                      <p className="text-xs text-gray-400">
                        Jour du mois pour les frais mensuels
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Année scolaire</Label>
                      <Select onValueChange={(val) => setFeeValue('schoolYearId', val as string)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner..." />
                        </SelectTrigger>
                        <SelectContent>
                          {schoolYears?.map((year) => (
                            <SelectItem key={year.id} value={year.id}>
                              {year.name} {year.isCurrent ? '⭐' : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {feeErrors.schoolYearId && (
                        <p className="text-xs text-red-500">{feeErrors.schoolYearId.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Description (optionnel)</Label>
                    <Input
                      placeholder="Description du frais..."
                      {...registerFee('description')}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={creatingFee}
                  >
                    {creatingFee ? 'Création...' : 'Créer le type de frais'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Liste des frais */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    Types de frais configurés
                  </CardTitle>
                  <Select onValueChange={setFeeYearId}>
                    <SelectTrigger className="w-36">
                      <SelectValue placeholder="Toutes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Toutes les années</SelectItem>
                      {schoolYears?.map((year) => (
                        <SelectItem key={year.id} value={year.id}>
                          {year.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {loadingFees ? (
                  <p className="text-center text-gray-500 py-4">Chargement...</p>
                ) : feeConfigs?.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">
                    Aucun frais configuré
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nom</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Montant</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {feeConfigs?.map((fee: FeeConfig) => (
                        <TableRow key={fee.id}>
                          <TableCell className="font-medium">
                            {fee.name}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {feeTypeLabels[fee.type] ?? fee.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium text-blue-600">
                            {formatAmount(fee.amount)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => {
                                if (confirm('Supprimer ce type de frais ?')) {
                                  deleteFee(fee.id)
                                }
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Onglet Utilisateurs ── */}
        <TabsContent value="users" className="mt-6">
          <Card className="max-w-lg">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-600" />
                Ajouter un utilisateur
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={handleUserSubmit((data) => createUser(data))}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Prénom</Label>
                    <Input
                      placeholder="Prénom"
                      {...registerUser('firstName')}
                    />
                    {userErrors.firstName && (
                      <p className="text-xs text-red-500">{userErrors.firstName.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Nom</Label>
                    <Input
                      placeholder="Nom"
                      {...registerUser('lastName')}
                    />
                    {userErrors.lastName && (
                      <p className="text-xs text-red-500">{userErrors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    placeholder="email@votreecole.ma"
                    {...registerUser('email')}
                  />
                  {userErrors.email && (
                    <p className="text-xs text-red-500">{userErrors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Mot de passe</Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    {...registerUser('password')}
                  />
                  {userErrors.password && (
                    <p className="text-xs text-red-500">{userErrors.password.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Rôle</Label>
                  <Select onValueChange={(val) => setUserValue('role', val as string)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un rôle..." />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(roleLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {userErrors.role && (
                    <p className="text-xs text-red-500">{userErrors.role.message}</p>
                  )}
                </div>

                <Separator />

                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-sm text-blue-700 font-medium">Permissions par rôle</p>
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-blue-600">📋 <strong>Secrétaire</strong> — gère élèves, parents, classes</p>
                    <p className="text-xs text-blue-600">💰 <strong>Comptable</strong> — gère frais, factures, paiements</p>
                    <p className="text-xs text-blue-600">📚 <strong>Enseignant</strong> — consulte élèves et classes</p>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={creatingUser}
                >
                  {creatingUser ? 'Création...' : 'Créer l\'utilisateur'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Onglet École ── */}
        <TabsContent value="school" className="mt-6">
            <SchoolSettings />
        </TabsContent>
      </Tabs>
    </div>
  )
}