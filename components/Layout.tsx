'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth, canEditPatients } from '@/context/AuthContext'
import { useAccent } from '@/context/AccentContext'
import ConfirmDialog from '@/components/ConfirmDialog'

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const canAddPatient = canEditPatients(user?.role)
  const { accent, toggleAccent } = useAccent()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
    setShowLogoutConfirm(false)
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    const q = searchQuery.trim()
    if (q) router.push(`/patients?search=${encodeURIComponent(q)}`)
    else router.push('/patients')
  }

  const nav = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/patients', label: 'Patients' },
    ...(user?.role === 'admin' ? [{ href: '/staff', label: 'Staff' }] : []),
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b-2 border-slate-300 sticky top-0 z-10 safe-area-inset-top shadow-sm">
        <div className="max-w-5xl mx-auto px-3 sm:px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 min-w-0">
          <nav className="flex flex-wrap gap-1 sm:gap-6 min-w-0 items-center">
            {nav.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`text-base font-bold py-2.5 px-2 -mx-1 rounded touch-manipulation min-h-[44px] sm:min-h-0 inline-flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[var(--color-ring)] ${
                  pathname === href
                    ? 'nav-link-active'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                {label}
              </Link>
            ))}
            {/* Search patients - always visible */}
            <form onSubmit={handleSearchSubmit} className="flex gap-1 sm:ml-2 min-w-0 flex-1 w-full max-w-full sm:max-w-xs sm:flex-initial">
              <input
                type="search"
                placeholder="Name, phone, location…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-accent flex-1 min-w-0 placeholder-gray-500 sm:min-h-9 min-h-[44px]"
                aria-label="Search patients"
              />
              <button
                type="submit"
                className="btn-primary px-3 py-2 shrink-0 min-h-[44px] sm:min-h-9"
              >
                Search
              </button>
            </form>
            {canAddPatient && (
              <Link
                href="/patients?add=1"
                className="btn-primary px-4 py-2.5 shrink-0 inline-flex items-center min-h-[44px] sm:min-h-0"
              >
                Add patient
              </Link>
            )}
          </nav>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 self-start sm:self-center flex-wrap">
            <button
              type="button"
              onClick={toggleAccent}
              title={accent === 'blue' ? 'Switch to green accent' : 'Switch to blue accent'}
              className={`rounded-full border-2 border-slate-300 touch-manipulation shrink-0 hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[var(--color-ring)] ${
                accent === 'blue' ? 'w-7 h-7 bg-[#2F80ED]' : 'w-7 h-7 bg-emerald-500'
              }`}
              aria-label="Change color accent"
            />
            {user && (
              <span
                className="text-base font-bold text-gray-700 truncate max-w-[140px] sm:max-w-[200px]"
                title={user.name?.trim() ? `${user.name} (${user.email})` : user.email}
              >
                {user.name?.trim() || user.email}
              </span>
            )}
            <button
              type="button"
              onClick={() => setShowLogoutConfirm(true)}
              className="text-base font-bold text-gray-700 hover:text-gray-900 py-2.5 px-3 rounded touch-manipulation inline-flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[var(--color-ring)]"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-5xl w-full mx-auto px-3 sm:px-4 py-4 sm:py-8 min-w-0 overflow-x-hidden">{children}</main>

      {showLogoutConfirm && (
        <ConfirmDialog
          title="Log out"
          message="Are you sure you want to log out?"
          confirmLabel="Log out"
          cancelLabel="Cancel"
          onConfirm={handleLogout}
          onCancel={() => setShowLogoutConfirm(false)}
        />
      )}
    </div>
  )
}
