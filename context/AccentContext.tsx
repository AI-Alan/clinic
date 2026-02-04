'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'

const STORAGE_KEY = 'clinic-accent'
export type Accent = 'blue' | 'emerald'

type AccentContextValue = {
  accent: Accent
  setAccent: (a: Accent) => void
  toggleAccent: () => void
}

const AccentContext = createContext<AccentContextValue | null>(null)

function getStored(): Accent {
  if (typeof window === 'undefined') return 'blue'
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    return v === 'emerald' ? 'emerald' : 'blue'
  } catch {
    return 'blue'
  }
}

export function AccentProvider({ children }: { children: React.ReactNode }) {
  const [accent, setAccentState] = useState<Accent>('blue')

  useEffect(() => {
    setAccentState(getStored())
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-accent', accent)
    try {
      localStorage.setItem(STORAGE_KEY, accent)
    } catch {}
  }, [accent])

  const setAccent = useCallback((a: Accent) => setAccentState(a), [])
  const toggleAccent = useCallback(() => {
    setAccentState((prev) => (prev === 'blue' ? 'emerald' : 'blue'))
  }, [])

  return (
    <AccentContext.Provider value={{ accent, setAccent, toggleAccent }}>
      {children}
    </AccentContext.Provider>
  )
}

export function useAccent() {
  const ctx = useContext(AccentContext)
  if (!ctx) return { accent: 'blue' as Accent, setAccent: () => {}, toggleAccent: () => {} }
  return ctx
}
