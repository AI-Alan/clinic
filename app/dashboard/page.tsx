'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Layout from '@/components/Layout'
import { apiFetch } from '@/lib/apiClient'
import { useAuth } from '@/context/AuthContext'
import { canManageQueue } from '@/lib/rbac'

type PatientRef = { _id: string; name: string; age?: number; gender?: string; phone?: string }
type Appointment = {
  _id: string
  patientId: PatientRef
  order: number
  status: string
  visitedAt?: string
}

function todayISO(): string {
  const d = new Date()
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
}

export default function DashboardPage() {
  const pathname = usePathname()
  const { user } = useAuth()
  const [total, setTotal] = useState<number | null>(null)
  const [queued, setQueued] = useState<Appointment[]>([])
  const [visited, setVisited] = useState<Appointment[]>([])
  const [loadingQueue, setLoadingQueue] = useState(true)
  const [showVisitedModal, setShowVisitedModal] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [historyDate, setHistoryDate] = useState<string | null>(null)
  const [historyVisited, setHistoryVisited] = useState<Appointment[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)

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

  const fetchAppointments = useCallback(() => {
    setLoadingQueue(true)
    const date = todayISO()
    apiFetch(`/api/appointments?date=${date}`, { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : { queued: [], visited: [] }))
      .then((data) => {
        setQueued(Array.isArray(data.queued) ? data.queued : [])
        setVisited(Array.isArray(data.visited) ? data.visited : [])
      })
      .catch(() => {
        setQueued([])
        setVisited([])
      })
      .finally(() => setLoadingQueue(false))
  }, [])

  useEffect(() => {
    if (pathname != null && pathname !== '/dashboard') return
    fetchTotal()
    fetchAppointments()
  }, [pathname, fetchTotal, fetchAppointments])

  useEffect(() => {
    const onFocus = () => {
      if (typeof window !== 'undefined' && window.location.pathname === '/dashboard') {
        fetchTotal()
        fetchAppointments()
      }
    }
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [fetchTotal, fetchAppointments])

  useEffect(() => {
    if (!historyDate) {
      setHistoryVisited([])
      return
    }
    setLoadingHistory(true)
    apiFetch(`/api/appointments?date=${historyDate}`, { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : { visited: [] }))
      .then((data) => setHistoryVisited(Array.isArray(data.visited) ? data.visited : []))
      .catch(() => setHistoryVisited([]))
      .finally(() => setLoadingHistory(false))
  }, [historyDate])

  const payload = user ? { sub: user.id, email: user.email, role: user.role } : null
  const canManage = canManageQueue(payload)

  async function handleMarkVisited(appointmentId: string) {
    const res = await apiFetch(`/api/appointments/${appointmentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'visited' }),
    })
    if (res.ok) fetchAppointments()
  }

  async function handleMoveUp(appointmentId: string, currentOrder: number) {
    if (currentOrder <= 0) return
    const res = await apiFetch(`/api/appointments/${appointmentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order: currentOrder - 1 }),
    })
    if (res.ok) fetchAppointments()
  }

  async function handleMoveDown(appointmentId: string, currentOrder: number) {
    if (currentOrder >= queued.length - 1) return
    const res = await apiFetch(`/api/appointments/${appointmentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order: currentOrder + 1 }),
    })
    if (res.ok) fetchAppointments()
  }

  async function handleRemoveFromQueue(appointmentId: string) {
    const res = await apiFetch(`/api/appointments/${appointmentId}`, { method: 'DELETE' })
    if (res.ok) fetchAppointments()
  }

  return (
    <Layout>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">Dashboard</h1>

      {/* Three-column: Today's visited, History, Total patients - same card style */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg border-2 border-slate-300 border-l-4 border-l-[var(--color-primary)] p-4 sm:p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Today&apos;s visited</h2>
          <p className="text-base font-bold text-gray-700 mb-2">
            {loadingQueue ? '—' : `${visited.length} ${visited.length === 1 ? 'patient' : 'patients'}`}
          </p>
          <button
            type="button"
            onClick={() => setShowVisitedModal(true)}
            className="btn-primary px-3 py-2 text-sm w-full sm:w-auto"
          >
            View
          </button>
        </div>
        <div className="bg-white rounded-lg border-2 border-slate-300 border-l-4 border-l-[var(--color-primary)] p-4 sm:p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-2">History</h2>
          <input
            type="date"
            value={historyDate ?? ''}
            onChange={(e) => setHistoryDate(e.target.value || null)}
            className="input-accent w-full mb-3 text-sm min-h-[36px]"
          />
          <p className="text-base font-bold text-gray-700 mb-2">
            {!historyDate ? '—' : loadingHistory ? '…' : `${historyVisited.length} ${historyVisited.length === 1 ? 'patient' : 'patients'}`}
          </p>
          <button
            type="button"
            onClick={() => setShowHistoryModal(true)}
            disabled={!historyDate}
            className="btn-primary px-3 py-2 text-sm w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
          >
            View
          </button>
        </div>
        <div className="bg-white rounded-lg border-2 border-slate-300 border-l-4 border-l-[var(--color-primary)] p-4 sm:p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Total patients</h2>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            {total === null ? '—' : total}
          </p>
          <Link href="/patients" className="btn-primary px-3 py-2 text-sm inline-block">
            View all →
          </Link>
        </div>
      </div>

      {/* Today's queue */}
      <section className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">Today&apos;s queue</h2>
        <div className="bg-white rounded-lg border-2 border-slate-300 p-4 sm:p-6 shadow-sm">
          {loadingQueue ? (
            <p className="text-gray-600 text-base font-semibold">Loading…</p>
          ) : (
            <>
              <p className="text-base font-bold text-gray-700 mb-3">
                {queued.length} {queued.length === 1 ? 'patient' : 'patients'} in queue
              </p>
              {queued.length === 0 ? (
                <p className="text-gray-600 text-base font-medium">No one in queue for today.</p>
              ) : (
                <ul className="divide-y-2 divide-slate-200">
                  {queued.map((apt, idx) => {
                    const patient = apt.patientId as PatientRef
                    const patientId = typeof patient === 'object' && patient?._id ? patient._id : (apt as unknown as { patientId: string }).patientId
                    const name = typeof patient === 'object' && patient?.name ? patient.name : 'Patient'
                    return (
                      <li key={apt._id} className="flex flex-col sm:flex-row sm:items-center gap-2 py-3">
                        <div className="flex-1 min-w-0">
                          <span className="font-bold text-gray-900 text-base mr-2">{idx + 1}.</span>
                          <Link
                            href={`/patients/${patientId}`}
                            className="text-base font-bold text-gray-900 hover:underline break-words"
                          >
                            {name}
                          </Link>
                        </div>
                        {canManage && (
                          <div className="flex flex-wrap gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleMoveUp(apt._id, apt.order)}
                              disabled={idx === 0}
                              className="rounded border-2 border-slate-400 bg-white px-3 py-2 min-h-[44px] sm:min-h-0 text-base font-bold text-gray-800 hover:bg-slate-50 disabled:opacity-50 touch-manipulation"
                            >
                              Up
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveDown(apt._id, apt.order)}
                              disabled={idx === queued.length - 1}
                              className="rounded border-2 border-slate-400 bg-white px-3 py-2 min-h-[44px] sm:min-h-0 text-base font-bold text-gray-800 hover:bg-slate-50 disabled:opacity-50 touch-manipulation"
                            >
                              Down
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMarkVisited(apt._id)}
                              className="btn-primary px-3 py-2 min-h-[44px] sm:min-h-0"
                            >
                              Mark visited
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveFromQueue(apt._id)}
                              className="rounded border-2 border-red-300 bg-white px-3 py-2 min-h-[44px] sm:min-h-0 text-base font-bold text-red-700 hover:bg-red-50 touch-manipulation"
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </li>
                    )
                  })}
                </ul>
              )}
            </>
          )}
        </div>
      </section>

      {showVisitedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowVisitedModal(false)} />
          <div className="relative bg-white rounded-lg shadow-lg max-w-md w-full max-h-[85vh] overflow-hidden border-2 border-slate-300 flex flex-col">
            <div className="p-4 border-b border-slate-200 flex-shrink-0 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Today&apos;s visited</h3>
              <button
                type="button"
                onClick={() => setShowVisitedModal(false)}
                className="rounded border-2 border-slate-400 bg-white px-3 py-2 text-sm font-bold text-gray-800 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-4">
              {loadingQueue ? (
                <p className="text-gray-600 font-medium">Loading…</p>
              ) : visited.length === 0 ? (
                <p className="text-gray-600 font-medium">No patients marked as visited today yet.</p>
              ) : (
                <ul className="divide-y-2 divide-slate-200">
                  {visited.map((apt) => {
                    const patient = apt.patientId as PatientRef
                    const patientId = typeof patient === 'object' && patient?._id ? patient._id : (apt as unknown as { patientId: string }).patientId
                    const name = typeof patient === 'object' && patient?.name ? patient.name : 'Patient'
                    const time = apt.visitedAt
                      ? new Date(apt.visitedAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
                      : '—'
                    return (
                      <li key={apt._id} className="py-3 flex flex-col sm:flex-row sm:items-center gap-1">
                        <Link
                          href={`/patients/${patientId}`}
                          onClick={() => setShowVisitedModal(false)}
                          className="text-base font-bold text-gray-900 hover:underline break-words"
                        >
                          {name}
                        </Link>
                        <span className="text-gray-600 text-base font-medium sm:ml-2">{time}</span>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {showHistoryModal && historyDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowHistoryModal(false)} />
          <div className="relative bg-white rounded-lg shadow-lg max-w-md w-full max-h-[85vh] overflow-hidden border-2 border-slate-300 flex flex-col">
            <div className="p-4 border-b border-slate-200 flex-shrink-0 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">
                Visited on {new Date(historyDate + 'T12:00:00').toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
              </h3>
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="rounded border-2 border-slate-400 bg-white px-3 py-2 text-sm font-bold text-gray-800 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-4">
              {loadingHistory ? (
                <p className="text-gray-600 font-medium">Loading…</p>
              ) : historyVisited.length === 0 ? (
                <p className="text-gray-600 font-medium">No patients visited on this date.</p>
              ) : (
                <ul className="divide-y-2 divide-slate-200">
                  {historyVisited.map((apt) => {
                    const patient = apt.patientId as PatientRef
                    const patientId = typeof patient === 'object' && patient?._id ? patient._id : (apt as unknown as { patientId: string }).patientId
                    const name = typeof patient === 'object' && patient?.name ? patient.name : 'Patient'
                    const time = apt.visitedAt
                      ? new Date(apt.visitedAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
                      : '—'
                    return (
                      <li key={apt._id} className="py-3 flex flex-col sm:flex-row sm:items-center gap-1">
                        <Link
                          href={`/patients/${patientId}`}
                          onClick={() => setShowHistoryModal(false)}
                          className="text-base font-bold text-gray-900 hover:underline break-words"
                        >
                          {name}
                        </Link>
                        <span className="text-gray-600 text-base font-medium sm:ml-2">{time}</span>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

    </Layout>
  )
}
