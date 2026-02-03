'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useAuth()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  const nav = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/patients', label: 'Patients' },
    ...(user?.role === 'admin' ? [{ href: '/staff', label: 'Staff' }] : []),
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-3 sm:px-4 py-3 flex items-center justify-between gap-2">
          <nav className="flex gap-4 sm:gap-6 min-w-0">
            {nav.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`text-sm font-medium py-2 px-1 -mx-1 rounded touch-manipulation ${
                  pathname === href
                    ? 'text-slate-900'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>
          <button
            type="button"
            onClick={handleLogout}
            className="text-sm text-slate-600 hover:text-slate-900 py-2 px-2 rounded touch-manipulation shrink-0"
          >
            Logout
          </button>
        </div>
      </header>
      <main className="flex-1 max-w-5xl w-full mx-auto px-3 sm:px-4 py-4 sm:py-8 min-w-0">{children}</main>
    </div>
  )
}
