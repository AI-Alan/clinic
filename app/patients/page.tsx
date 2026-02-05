'use client'

import { Suspense, useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import Layout from '@/components/Layout'
import PatientForm from '@/components/PatientForm'
import { GENDERS } from '@/lib/constants'
import { apiFetch } from '@/lib/apiClient'
import { useAuth, canEditPatients as canEdit } from '@/context/AuthContext'
import { canAddToQueue } from '@/lib/rbac'
import { toTitleCase } from '@/lib/formatText'

type Patient = {
  _id: string
  name: string
  age: number
  gender: string
  phone?: string
  address?: string
  location?: string
  temperament?: string
  createdAt: string
}

const LIMIT_OPTIONS = [10, 20, 30, 50]

function PatientsPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const canAddPatient = canEdit(user?.role)
  const isAddOnlyMode = searchParams.get('add') === '1' && canAddPatient

  const [patients, setPatients] = useState<Patient[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [search, setSearch] = useState('')
  const [gender, setGender] = useState('')
  const [ageMin, setAgeMin] = useState('')
  const [ageMax, setAgeMax] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')
  const [appliedGender, setAppliedGender] = useState('')
  const [appliedAgeMin, setAppliedAgeMin] = useState('')
  const [appliedAgeMax, setAppliedAgeMax] = useState('')
  const [appliedDateFrom, setAppliedDateFrom] = useState('')
  const [appliedDateTo, setAppliedDateTo] = useState('')
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)
  const [showFilters, setShowFilters] = useState(false)
  const [showCreatedMessage, setShowCreatedMessage] = useState(false)
  const [queuedPatientIds, setQueuedPatientIds] = useState<Set<string>>(new Set())
  const [addingToQueueId, setAddingToQueueId] = useState<string | null>(null)

  function todayISO(): string {
    const d = new Date()
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
  }

  // Sync from navbar: URL ?search=
  useEffect(() => {
    if (searchParams.has('search')) {
      const q = searchParams.get('search')?.trim() ?? ''
      setSearch(q)
      setAppliedSearch(q)
    }
  }, [searchParams])

  const loadPatients = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (appliedSearch.trim()) params.set('search', appliedSearch.trim())
    if (appliedGender) params.set('gender', appliedGender)
    if (appliedAgeMin !== '') params.set('ageMin', appliedAgeMin)
    if (appliedAgeMax !== '') params.set('ageMax', appliedAgeMax)
    if (appliedDateFrom) params.set('dateFrom', appliedDateFrom)
    if (appliedDateTo) params.set('dateTo', appliedDateTo)
    params.set('page', String(page))
    params.set('limit', String(limit))
    apiFetch(`/api/patients?${params}`, { cache: 'no-store' })
      .then((res) => {
        if (!res.ok) return { patients: [], total: 0, totalPages: 0 }
        return res.json()
      })
      .then((data) => {
        setPatients(Array.isArray(data.patients) ? data.patients : [])
        setTotal(Number(data.total) ?? 0)
        setTotalPages(Number(data.totalPages) ?? 0)
      })
      .catch(() => {
        setPatients([])
        setTotal(0)
        setTotalPages(0)
      })
      .finally(() => setLoading(false))
  }, [appliedSearch, appliedGender, appliedAgeMin, appliedAgeMax, appliedDateFrom, appliedDateTo, page, limit, refreshKey])

  useEffect(() => {
    if (isAddOnlyMode) return
    loadPatients()
  }, [loadPatients, isAddOnlyMode])

  const canAdd = user ? canAddToQueue({ sub: user.id, email: user.email, role: user.role }) : false
  useEffect(() => {
    if (!canAdd) return
    const date = todayISO()
    apiFetch(`/api/appointments?date=${date}`, { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : { queued: [] }))
      .then((data) => {
        const list = Array.isArray(data.queued) ? data.queued : []
        const ids = new Set<string>(list.map((a: { patientId: { _id?: string } | string }) => typeof a.patientId === 'object' && a.patientId?._id ? a.patientId._id : (a as { patientId: string }).patientId))
        setQueuedPatientIds(ids)
      })
      .catch(() => setQueuedPatientIds(new Set()))
  }, [canAdd, refreshKey])

  // Show "Patient added" when landing with ?created=1, then clear param after 4s
  const createdParam = searchParams.get('created')
  useEffect(() => {
    if (createdParam !== '1') return
    setShowCreatedMessage(true)
    const t = setTimeout(() => {
      setShowCreatedMessage(false)
      const params = new URLSearchParams(searchParams.toString())
      params.delete('created')
      router.replace('/patients' + (params.toString() ? '?' + params.toString() : ''), { scroll: false })
    }, 4000)
    return () => clearTimeout(t)
  }, [createdParam, router, searchParams])

  function handleCreated() {
    setPage(1)
    setRefreshKey((k) => k + 1)
  }

  async function handleAddToQueue(patientId: string) {
    setAddingToQueueId(patientId)
    const date = todayISO()
    const res = await apiFetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientId, date }),
    })
    setAddingToQueueId(null)
    if (res.ok) setQueuedPatientIds((prev) => new Set(prev).add(patientId))
  }

  function applyFilters() {
    setAppliedSearch(search)
    setAppliedGender(gender)
    setAppliedAgeMin(ageMin)
    setAppliedAgeMax(ageMax)
    setAppliedDateFrom(dateFrom)
    setAppliedDateTo(dateTo)
    setPage(1)
  }

  function clearFilters() {
    setSearch('')
    setGender('')
    setAgeMin('')
    setAgeMax('')
    setDateFrom('')
    setDateTo('')
    setAppliedSearch('')
    setAppliedGender('')
    setAppliedAgeMin('')
    setAppliedAgeMax('')
    setAppliedDateFrom('')
    setAppliedDateTo('')
    setPage(1)
    router.replace('/patients')
  }

  // Add-patient-only view: only form, no filters or list
  if (isAddOnlyMode) {
    return (
      <Layout>
        <div className="mb-4">
          <Link
            href="/patients"
            className="text-base font-bold text-gray-700 hover:text-gray-900 py-2.5 inline-block touch-manipulation"
          >
            ← Back to patients
          </Link>
        </div>
        <PatientForm
          onCancel={() => router.replace('/patients')}
          onSaved={() => {
            handleCreated()
            router.replace('/patients?created=1')
          }}
        />
      </Layout>
    )
  }

  return (
    <Layout>
      {showCreatedMessage && (
        <div className="mb-4 rounded-lg bg-green-100 border-2 border-green-400 px-4 py-3 text-base font-bold text-green-800" role="alert">
          Patient added successfully.
        </div>
      )}
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">Patients</h1>

      {/* Filters: collapsed by default, expand with "Show filters" */}
      <div className="mb-4 sm:mb-6">
        <button
          type="button"
          onClick={() => setShowFilters((v) => !v)}
          className="flex items-center gap-2 text-base font-bold text-gray-700 hover:text-gray-900 touch-manipulation py-2"
          aria-expanded={showFilters}
        >
          {showFilters ? 'Hide filters ▲' : 'Show filters (gender, age, date) ▼'}
        </button>
        {showFilters && (
          <div className="bg-white rounded-lg border-2 border-slate-300 p-3 sm:p-4 shadow-sm mt-1 overflow-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3 items-end">
              <div>
                <label className="block text-base font-bold text-gray-700 mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full rounded border-2 border-slate-400 px-3 py-2 text-base font-medium text-gray-900 focus:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500"
                >
                  <option value="">All</option>
                  {GENDERS.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-base font-bold text-gray-700 mb-1">Age from</label>
                <input
                  type="number"
                  min={0}
                  max={150}
                  placeholder="Min"
                  value={ageMin}
                  onChange={(e) => setAgeMin(e.target.value)}
                  className="w-full rounded border-2 border-slate-400 px-3 py-2 text-base font-medium text-gray-900 focus:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500"
                />
              </div>
              <div>
                <label className="block text-base font-bold text-gray-700 mb-1">Age to</label>
                <input
                  type="number"
                  min={0}
                  max={150}
                  placeholder="Max"
                  value={ageMax}
                  onChange={(e) => setAgeMax(e.target.value)}
                  className="w-full rounded border-2 border-slate-400 px-3 py-2 text-base font-medium text-gray-900 focus:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500"
                />
              </div>
              <div>
                <label className="block text-base font-bold text-gray-700 mb-1">Created from</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full rounded border-2 border-slate-400 px-3 py-2 text-base font-medium text-gray-900 focus:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500"
                />
              </div>
              <div>
                <label className="block text-base font-bold text-gray-700 mb-1">Created to</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full rounded border-2 border-slate-400 px-3 py-2 text-base font-medium text-gray-900 focus:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500"
                />
              </div>
              <div className="flex gap-2 sm:col-span-2">
                <button
                  type="button"
                  onClick={applyFilters}
                  className="btn-primary px-4 py-3 flex-1 sm:flex-none"
                >
                  Apply
                </button>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="rounded border-2 border-slate-400 bg-white px-4 py-3 text-base font-bold text-gray-800 hover:bg-slate-50 touch-manipulation flex-1 sm:flex-none"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg border-2 border-slate-300 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 sm:p-8 text-center text-gray-700 text-base font-semibold">Loading…</div>
        ) : patients.length === 0 ? (
          <div className="p-6 sm:p-8 text-center text-gray-600 text-base font-semibold">
            <p>No patients found.</p>
            {canAddPatient && (
              <p className="mt-2 font-medium">Use the <strong>Add patient</strong> button above to add one.</p>
            )}
          </div>
        ) : (
          <>
            <ul className="divide-y-2 divide-slate-200">
              {patients.map((p) => {
                const inQueue = queuedPatientIds.has(p._id)
                return (
                  <li key={p._id} className="flex flex-col sm:flex-row sm:items-center gap-2 px-3 sm:px-4 py-3 hover:bg-slate-50 sm:gap-3">
                    <Link
                      href={`/patients/${p._id}`}
                      className="flex-1 min-w-0 touch-manipulation active:bg-slate-100 rounded"
                    >
                      <span className="font-bold text-gray-900 block sm:inline text-base">{toTitleCase(p.name)}</span>
                      <span className="text-gray-700 text-base font-medium block sm:inline sm:ml-2 mt-0.5 sm:mt-0 break-words">
                        {p.age} yrs · {toTitleCase(p.gender)}
                        {p.phone ? ` · ${p.phone}` : ''}
                        {p.location ? ` · ${toTitleCase(p.location)}` : ''}
                        {p.temperament ? ` · ${p.temperament}` : ''}
                      </span>
                    </Link>
                    {canAdd && (
                      <span className="shrink-0">
                        {inQueue ? (
                          <span className="text-sm font-medium text-slate-500 px-2 py-1.5">In queue</span>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault()
                              handleAddToQueue(p._id)
                            }}
                            disabled={!!addingToQueueId}
                            className="btn-primary px-3 py-2 text-sm touch-manipulation disabled:opacity-50"
                          >
                            {addingToQueueId === p._id ? 'Adding…' : 'Add to queue'}
                          </button>
                        )}
                      </span>
                    )}
                  </li>
                )
              })}
            </ul>
            {/* Pagination */}
            <div className="px-3 sm:px-4 py-3 border-t-2 border-slate-200 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-between gap-3">
              <div className="text-base font-semibold text-gray-700 order-2 sm:order-1">
                Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 order-1 sm:order-2">
                <label className="flex items-center gap-2 text-base font-bold text-gray-700">
                  Per page
                  <select
                    value={limit}
                    onChange={(e) => {
                      setLimit(Number(e.target.value))
                      setPage(1)
                    }}
                    className="rounded border-2 border-slate-400 px-2 py-2 text-base font-medium text-gray-900 min-h-[44px] sm:min-h-0"
                  >
                    {LIMIT_OPTIONS.map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </label>
                <div className="flex gap-1 items-center">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="rounded border-2 border-slate-400 bg-white px-3 py-2 text-base font-bold text-gray-800 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                  >
                    Previous
                  </button>
                  <span className="px-2 sm:px-3 py-1 text-base font-bold text-gray-700 whitespace-nowrap">
                    Page {page} of {totalPages || 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages || 1, p + 1))}
                    disabled={page >= totalPages}
                    className="rounded border-2 border-slate-400 bg-white px-3 py-2 text-base font-bold text-gray-800 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  )
}

export default function PatientsPage() {
  return (
    <Suspense fallback={<Layout><div className="py-8 text-center text-gray-700 font-semibold">Loading patients…</div></Layout>}>
      <PatientsPageContent />
    </Suspense>
  )
}
