'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth, canEditPatients } from '@/context/AuthContext'
import { useAccent } from '@/context/AccentContext'
import ConfirmDialog from '@/components/ConfirmDialog'

function NavLinks({
  pathname,
  nav,
  className = '',
}: {
  pathname: string
  nav: { href: string; label: string }[]
  className?: string
}) {
  return (
    <>
      {nav.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={`text-sm font-bold py-1.5 px-2 -mx-1 rounded touch-manipulation min-h-[36px] inline-flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[var(--color-ring)] ${className} ${
            pathname === href ? 'nav-link-active' : 'text-gray-700 hover:text-gray-900'
          }`}
        >
          {label}
        </Link>
      ))}
    </>
  )
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
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
    setMenuOpen(false)
  }

  const nav = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/patients', label: 'Patients' },
    ...(user?.role === 'admin' ? [{ href: '/staff', label: 'Staff' }] : []),
  ]

  // Close drawer when route changes (e.g. after clicking a link)
  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b-2 border-slate-300 sticky top-0 z-10 safe-area-inset-top shadow-sm">
        <div className="max-w-5xl mx-auto px-2 sm:px-4 py-1.5 sm:py-2 min-w-0">
          {/* Wide: left = nav + search + Add patient; right = accent + profile + logout */}
          <div className="hidden md:flex flex-row flex-nowrap items-center justify-between gap-3 min-w-0">
            <div className="flex flex-nowrap items-center gap-3 min-w-0 shrink">
              <NavLinks pathname={pathname} nav={nav} className="sm:min-h-0" />
              <form
                onSubmit={handleSearchSubmit}
                className="flex gap-1 min-w-0 w-[200px] sm:w-[240px] lg:w-[280px] shrink-0"
              >
                <input
                  type="search"
                  placeholder="Search patients…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-accent flex-1 min-w-0 text-sm min-h-8 placeholder-gray-500"
                  aria-label="Search patients"
                />
                <button type="submit" className="btn-primary px-2 py-1.5 shrink-0 text-sm min-h-8">
                  Search
                </button>
              </form>
              {canAddPatient && (
                <Link
                  href="/patients?add=1"
                  className="btn-primary px-3 py-1.5 shrink-0 inline-flex items-center text-sm"
                >
                  Add patient
                </Link>
              )}
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={toggleAccent}
                title={accent === 'blue' ? 'Switch to green accent' : 'Switch to blue accent'}
                className={`rounded-full border-2 border-slate-300 touch-manipulation shrink-0 hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[var(--color-ring)] w-6 h-6 ${
                  accent === 'blue' ? 'bg-[#2F80ED]' : 'bg-emerald-500'
                }`}
                aria-label="Change color accent"
              />
              {user && (
                <span
                  className="text-xs font-bold text-gray-700 truncate max-w-[120px] lg:max-w-[180px]"
                  title={user.name?.trim() ? `${user.name} (${user.email})` : user.email}
                >
                  {user.name?.trim() || user.email}
                </span>
              )}
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(true)}
                className="text-xs font-bold text-gray-700 hover:text-gray-900 py-1.5 px-2 rounded touch-manipulation shrink-0"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Small: hamburger + compact right */}
          <div className="flex md:hidden flex-row flex-nowrap items-center justify-between gap-2 min-w-0">
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className="p-2 -ml-2 rounded touch-manipulation min-h-[36px] inline-flex items-center justify-center text-gray-700 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[var(--color-ring)]"
              aria-label="Open menu"
              aria-expanded={menuOpen}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <span className="text-sm font-bold text-gray-800 truncate min-w-0">Menu</span>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={toggleAccent}
                title={accent === 'blue' ? 'Switch to green accent' : 'Switch to blue accent'}
                className={`rounded-full border-2 border-slate-300 w-6 h-6 shrink-0 ${
                  accent === 'blue' ? 'bg-[#2F80ED]' : 'bg-emerald-500'
                }`}
                aria-label="Change color accent"
              />
              {user && (
                <span className="text-xs font-bold text-gray-700 truncate max-w-[80px]" title={user.email}>
                  {user.name?.trim() || user.email}
                </span>
              )}
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(true)}
                className="text-xs font-bold text-gray-700 hover:text-gray-900 py-1.5 px-2 rounded"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Drawer (mobile only) */}
        {menuOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setMenuOpen(false)}
              aria-hidden
            />
            <div className="fixed top-[53px] left-0 right-0 bottom-0 z-50 bg-white border-t-2 border-slate-200 overflow-y-auto md:hidden">
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-900">Menu</h2>
                  <button
                    type="button"
                    onClick={() => setMenuOpen(false)}
                    className="p-2 rounded text-gray-600 hover:bg-slate-100 font-bold"
                    aria-label="Close menu"
                  >
                    Close
                  </button>
                </div>
                <nav className="flex flex-col gap-1">
                  <NavLinks pathname={pathname} nav={nav} className="py-3 text-base" />
                </nav>
                <form onSubmit={handleSearchSubmit} className="flex gap-2">
                  <input
                    type="search"
                    placeholder="Search patients…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-accent flex-1 min-h-[44px]"
                    aria-label="Search patients"
                  />
                  <button type="submit" className="btn-primary px-4 py-2 min-h-[44px]">
                    Search
                  </button>
                </form>
                {canAddPatient && (
                  <Link
                    href="/patients?add=1"
                    onClick={() => setMenuOpen(false)}
                    className="btn-primary px-4 py-3 inline-flex items-center justify-center w-full text-base"
                  >
                    Add patient
                  </Link>
                )}
              </div>
            </div>
          </>
        )}
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
