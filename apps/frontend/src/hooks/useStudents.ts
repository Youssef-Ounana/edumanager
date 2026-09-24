import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axios'
import type { Student } from '@/types'

// ─── LISTER LES ÉLÈVES ──────────────────────────────────────────────────────

export function useStudents() {
  return useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const response = await api.get<Student[]>('/students')
      return response.data
    },
  })
}

// ─── DÉTAIL D'UN ÉLÈVE ──────────────────────────────────────────────────────

export function useStudent(id: string) {
  return useQuery({
    queryKey: ['students', id],
    queryFn: async () => {
      const response = await api.get<Student>(`/students/${id}`)
      return response.data
    },
    enabled: !!id,
  })
}

// ─── CRÉER UN ÉLÈVE ─────────────────────────────────────────────────────────

export function useCreateStudent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (dto: Partial<Student> & {
      firstName: string
      lastName: string
      dateOfBirth: string
      gender: 'MALE' | 'FEMALE'
      registrationNr: string
    }) => {
      const response = await api.post<Student>('/students', dto)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] })
    },
  })
}

// ─── MODIFIER UN ÉLÈVE ──────────────────────────────────────────────────────

export function useUpdateStudent(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (dto: Partial<Student>) => {
      const response = await api.put<Student>(`/students/${id}`, dto)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] })
      queryClient.invalidateQueries({ queryKey: ['students', id] })
    },
  })
}

// ─── SUPPRIMER UN ÉLÈVE ─────────────────────────────────────────────────────

export function useDeleteStudent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/students/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] })
    },
  })
}