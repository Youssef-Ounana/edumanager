import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axios'
import type { FeeConfig, Invoice, Payment, FinancialSummary } from '@/types'

// ─── CONFIGURATIONS DES FRAIS ────────────────────────────────────────────────

export function useFeeConfigs(schoolYearId?: string) {
  return useQuery({
    queryKey: ['fee-configs', schoolYearId],
    queryFn: async () => {
      const params = schoolYearId ? `?schoolYearId=${schoolYearId}` : ''
      const response = await api.get<FeeConfig[]>(`/payments/fee-configs${params}`)
      return response.data
    },
  })
}

export function useCreateFeeConfig() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (dto: {
      name: string
      type: string
      amount: number
      schoolYearId: string
      dueDay?: number
      description?: string
    }) => {
      const response = await api.post<FeeConfig>('/payments/fee-configs', dto)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-configs'] })
    },
  })
}

// ─── FACTURES ────────────────────────────────────────────────────────────────

export function useInvoices(studentId?: string) {
  return useQuery({
    queryKey: ['invoices', studentId],
    queryFn: async () => {
      const params = studentId ? `?studentId=${studentId}` : ''
      const response = await api.get<Invoice[]>(`/payments/invoices${params}`)
      return response.data
    },
  })
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: ['invoices', id],
    queryFn: async () => {
      const response = await api.get<Invoice>(`/payments/invoices/${id}`)
      return response.data
    },
    enabled: !!id,
  })
}

export function useCreateInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (dto: {
      studentId: string
      feeConfigId: string
      dueDate: string
      notes?: string
    }) => {
      const response = await api.post<Invoice>('/payments/invoices', dto)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['financial-summary'] })
    },
  })
}

// ─── PAIEMENTS ───────────────────────────────────────────────────────────────

export function usePayments() {
  return useQuery({
    queryKey: ['payments'],
    queryFn: async () => {
      const response = await api.get<Payment[]>('/payments')
      return response.data
    },
  })
}

export function useCreatePayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (dto: {
      invoiceId: string
      amount: number
      method: string
      reference?: string
    }) => {
      const response = await api.post<Payment>('/payments', dto)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['financial-summary'] })
    },
  })
}

// ─── RÉSUMÉ FINANCIER ────────────────────────────────────────────────────────

export function useFinancialSummary() {
  return useQuery({
    queryKey: ['financial-summary'],
    queryFn: async () => {
      const response = await api.get<FinancialSummary>('/payments/summary')
      return response.data
    },
  })
}