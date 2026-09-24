'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import { useCreateInvoice } from '@/hooks/usePayments'
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
import { Plus } from 'lucide-react'
import type { Student, FeeConfig } from '@/types'

const schema = z.object({
  studentId: z.string().min(1, 'Élève obligatoire'),
  feeConfigId: z.string().min(1, 'Type de frais obligatoire'),
  dueDate: z.string().min(1, 'Date d\'échéance obligatoire'),
  notes: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export function CreateInvoiceModal() {
  const [open, setOpen] = useState(false)
  const { mutate: createInvoice, isPending } = useCreateInvoice()

  const { data: students } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const response = await api.get<Student[]>('/students')
      return response.data
    },
  })

  const { data: feeConfigs } = useQuery({
    queryKey: ['fee-configs'],
    queryFn: async () => {
      const response = await api.get<FeeConfig[]>('/payments/fee-configs')
      return response.data
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
    createInvoice(data, {
      onSuccess: () => {
        setOpen(false)
        reset()
      },
    })
  }

  const formatAmount = (amount: number) =>
    new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
    }).format(amount)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger >
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Nouvelle facture
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Créer une facture</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Élève</Label>
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
            <Label>Type de frais</Label>
            <Select onValueChange={(val) => setValue('feeConfigId', val as string)}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un type..." />
              </SelectTrigger>
              <SelectContent>
                {feeConfigs?.length === 0 ? (
                  <SelectItem value="none" disabled>
                    Aucun frais configuré
                  </SelectItem>
                ) : (
                  feeConfigs?.map((fee) => (
                    <SelectItem key={fee.id} value={fee.id}>
                      {fee.name} — {formatAmount(fee.amount)}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.feeConfigId && (
              <p className="text-xs text-red-500">{errors.feeConfigId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Date d'échéance</Label>
            <Input type="date" {...register('dueDate')} />
            {errors.dueDate && (
              <p className="text-xs text-red-500">{errors.dueDate.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Notes (optionnel)</Label>
            <Input
              placeholder="Remarques..."
              {...register('notes')}
            />
          </div>

          {feeConfigs?.length === 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <p className="text-sm text-orange-700">
                ⚠️ Aucun type de frais configuré. Configurez d'abord les frais dans les paramètres.
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => { setOpen(false); reset() }}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isPending || feeConfigs?.length === 0}
            >
              {isPending ? 'Création...' : 'Créer facture'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}