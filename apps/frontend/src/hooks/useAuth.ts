import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import api from '@/lib/axios'
import { useAuthStore } from '@/lib/store'
import type { LoginResponse } from '@/types'

interface LoginDto {
  email: string
  password: string
}

export function useLogin() {
  const router = useRouter()
  const setAuth = useAuthStore((state) => state.setAuth)

  return useMutation({
    mutationFn: async (dto: LoginDto) => {
      const response = await api.post<LoginResponse>('/auth/login', dto)
      return response.data
    },
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken, data.refreshToken)
      router.push('/dashboard')
    },
  })
}

export function useLogout() {
  const router = useRouter()
  const logout = useAuthStore((state) => state.logout)

  return useMutation({
    mutationFn: async () => {
      await api.post('/auth/logout')
    },
    onSuccess: () => {
      logout()
      router.push('/login')
    },
    onError: () => {
      logout()
      router.push('/login')
    },
  })
}