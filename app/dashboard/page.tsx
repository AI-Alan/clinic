'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Layout from '@/components/Layout'
import { apiFetch } from '@/lib/apiClient'

export default function DashboardPage() {
  const pathname = usePathname()
  const [total, setTotal] = useState<number | null>(null)

  const fetchTotal = useCallback(() => {
    setTotal(null)
    apiFetch('/api/patients?limit=1', { cache: 'no-store' })
      .then((res) => {
        if (!res.ok) return res.json().then(() => ({ total: 0 }))
        return res.json()
      })
      .then((data) => setTotal(Number(data.total) ?? 0))
      .catch(() => setTotal(0))
  }, [])

  useEffect(() => {
    if (pathname != null && pathname !== '/dashboard') return
    fetchTotal()
  }, [pathname, fetchTotal])

  useEffect(() => {
    const onFocus = () => {
      if (typeof window !== 'undefined' && window.location.pathname === '/dashboard') {
        fetchTotal()
      }
    }
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [fetchTotal])

  return (
    <Layout>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">Dashboard</h1>
      <div className="bg-white rounded-lg border-2 border-slate-300 border-l-4 border-l-[var(--color-primary)] p-4 sm:p-6 shadow-sm w-full">
        <p className="text-gray-700 mb-2 text-base font-bold">Total patients</p>
        <p className="text-3xl sm:text-4xl font-bold text-gray-900">
          {total === null ? '—' : total}
        </p>
        <p className="text-base font-medium text-gray-700 mt-2">
          Use <strong>Patients</strong> in the menu above to see the list or add a new patient.
        </p>
        <Link
          href="/patients"
          className="btn-primary inline-block mt-4 px-4 py-2"
        >
          View all patients →
        </Link>
      </div>
    </Layout>
  )
}
