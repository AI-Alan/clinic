'use client'

import { AuthProvider } from '@/context/AuthContext'
import { AccentProvider } from '@/context/AccentContext'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AccentProvider>
      <AuthProvider>{children}</AuthProvider>
    </AccentProvider>
  )
}
