'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import Layout from '@/components/Layout'
import PatientForm from '@/components/PatientForm'
import { GENDERS } from '@/lib/constants'
import { apiFetch } from '@/lib/apiClient'
import { useAuth, canEditPatients as canEdit } from '@/context/AuthContext'

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

export default function PatientsPage() {
  const { user } = useAuth()
  const canAddPatient = canEdit(user?.role)
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
  const [showForm, setShowForm] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

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
    loadPatients()
  }, [loadPatients])

  function handleCreated() {
    setShowForm(false)
    setPage(1)
    setRefreshKey((k) => k + 1)
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
  }

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">Patients</h1>
        {canAddPatient && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="rounded bg-slate-800 text-white px-4 py-3 sm:py-2 text-sm font-medium hover:bg-slate-700 touch-manipulation w-full sm:w-auto"
          >
            Add patient
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-slate-200 p-3 sm:p-4 shadow-sm mb-4 sm:mb-6 overflow-hidden">
        <h2 className="text-sm font-medium text-slate-700 mb-3">Filters</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3 items-end">
          <div className="sm:col-span-2 lg:col-span-2">
            <label className="block text-xs text-slate-500 mb-1">Search (name, phone, location)</label>
            <input
              type="search"
              placeholder="Search…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-500 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            >
              <option value="">All</option>
              {GENDERS.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Age from</label>
            <input
              type="number"
              min={0}
              max={150}
              placeholder="Min"
              value={ageMin}
              onChange={(e) => setAgeMin(e.target.value)}
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Age to</label>
            <input
              type="number"
              min={0}
              max={150}
              placeholder="Max"
              value={ageMax}
              onChange={(e) => setAgeMax(e.target.value)}
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Created from</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Created to</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            />
          </div>
          <div className="flex gap-2 sm:col-span-2">
            <button
              type="button"
              onClick={applyFilters}
              className="rounded bg-slate-700 text-white px-4 py-3 sm:py-2 text-sm font-medium hover:bg-slate-600 touch-manipulation flex-1 sm:flex-none"
            >
              Apply
            </button>
            <button
              type="button"
              onClick={clearFilters}
              className="rounded border border-slate-300 bg-white px-4 py-3 sm:py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 touch-manipulation flex-1 sm:flex-none"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {canAddPatient && showForm && (
        <div className="mb-6">
          <PatientForm onCancel={() => setShowForm(false)} onSaved={handleCreated} />
        </div>
      )}

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 sm:p-8 text-center text-slate-500 text-sm sm:text-base">Loading…</div>
        ) : patients.length === 0 ? (
          <div className="p-6 sm:p-8 text-center text-slate-500 text-sm sm:text-base">No patients found.</div>
        ) : (
          <>
            <ul className="divide-y divide-slate-200">
              {patients.map((p) => (
                <li key={p._id}>
                  <Link
                    href={`/patients/${p._id}`}
                    className="block px-3 sm:px-4 py-3 hover:bg-slate-50 touch-manipulation active:bg-slate-100"
                  >
                    <span className="font-medium text-slate-900 block sm:inline">{p.name}</span>
                    <span className="text-slate-500 text-sm block sm:inline sm:ml-2 mt-0.5 sm:mt-0 break-words">
                      {p.age} yrs · {p.gender}
                      {p.phone ? ` · ${p.phone}` : ''}
                      {p.location ? ` · ${p.location}` : ''}
                      {p.temperament ? ` · ${p.temperament}` : ''}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            {/* Pagination */}
            <div className="px-3 sm:px-4 py-3 border-t border-slate-200 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-between gap-3">
              <div className="text-sm text-slate-600 order-2 sm:order-1">
                Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 order-1 sm:order-2">
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  Per page
                  <select
                    value={limit}
                    onChange={(e) => {
                      setLimit(Number(e.target.value))
                      setPage(1)
                    }}
                    className="rounded border border-slate-300 px-2 py-2 sm:py-1 text-slate-900 min-h-[44px] sm:min-h-0"
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
                    className="rounded border border-slate-300 bg-white px-3 py-2 sm:py-1 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                  >
                    Previous
                  </button>
                  <span className="px-2 sm:px-3 py-1 text-sm text-slate-600 whitespace-nowrap">
                    Page {page} of {totalPages || 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages || 1, p + 1))}
                    disabled={page >= totalPages}
                    className="rounded border border-slate-300 bg-white px-3 py-2 sm:py-1 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
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
