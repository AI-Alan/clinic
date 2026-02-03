import type { TokenPayload } from '@/lib/auth'

export function isAdmin(payload: TokenPayload | null): boolean {
  return payload?.role === 'admin'
}

export function canEditPatients(payload: TokenPayload | null): boolean {
  if (!payload) return false
  return payload.role === 'admin' || payload.role === 'doctor'
}

export function canEditVisits(payload: TokenPayload | null): boolean {
  if (!payload) return false
  return payload.role === 'admin' || payload.role === 'doctor'
}

export function canAccessStaff(payload: TokenPayload | null): boolean {
  return payload?.role === 'admin'
}
