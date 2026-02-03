'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Layout from '@/components/Layout'

export default function DashboardPage() {
  const pathname = usePathname()
  const [total, setTotal] = useState<number | null>(null)

  const fetchTotal = useCallback(() => {
    setTotal(null)
    fetch('/api/patients?limit=1', { cache: 'no-store', credentials: 'include' })
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
      <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-4 sm:mb-6">Dashboard</h1>
      <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6 shadow-sm w-full">
        <p className="text-slate-600 mb-2 text-sm sm:text-base">Total patients</p>
        <p className="text-2xl sm:text-3xl font-semibold text-slate-900">
          {total === null ? '—' : total}
        </p>
        <Link
          href="/patients"
          className="inline-block mt-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 touch-manipulation"
        >
          View all patients →
        </Link>
      </div>
    </Layout>
  )
}
