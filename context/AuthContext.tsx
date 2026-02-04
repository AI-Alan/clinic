'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export type Role = 'admin' | 'doctor' | 'nurse'

export type User = {
  id: string
  email: string
  role: Role
  name?: string
}

type AuthContextType = {
  user: User | null
  loading: boolean
  refetch: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  refetch: () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refetch = () => {
    setLoading(true)
    fetch('/api/auth/me', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.role) setUser({ id: data.id, email: data.email, role: data.role, name: data.name })
        else setUser(null)
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    refetch()
  }, [])

  // Refetch when navigating (e.g. after login redirect)
  useEffect(() => {
    if (pathname && pathname !== '/login') refetch()
  }, [pathname])

  return (
    <AuthContext.Provider value={{ user, loading, refetch }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

export function canEditPatients(role: Role | undefined): boolean {
  return role === 'admin' || role === 'doctor'
}

export function canEditVisits(role: Role | undefined): boolean {
  return role === 'admin' || role === 'doctor'
}

export function isAdmin(role: Role | undefined): boolean {
  return role === 'admin'
}
