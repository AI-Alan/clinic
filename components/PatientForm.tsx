'use client'

import { useState } from 'react'
import { TEMPERAMENT_OPTIONS, GENDERS } from '@/lib/constants'
import { apiFetch } from '@/lib/apiClient'

type PatientFormProps = {
  initial?: {
    name: string
    age: number
    gender: string
    phone?: string
    address?: string
    location?: string
    temperament?: string
  }
  patientId?: string
  onCancel: () => void
  onSaved: () => void
}

export default function PatientForm({
  initial,
  patientId,
  onCancel,
  onSaved,
}: PatientFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [age, setAge] = useState(initial?.age ?? '')
  const [gender, setGender] = useState(initial?.gender ?? '')
  const [phone, setPhone] = useState(initial?.phone ?? '')
  const [address, setAddress] = useState(initial?.address ?? '')
  const [location, setLocation] = useState(initial?.location ?? '')
  const [temperament, setTemperament] = useState(initial?.temperament ?? '')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const isEdit = !!patientId

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!name.trim() || !gender) {
      setError('Name and gender are required.')
      return
    }
    const ageNum = Number(age)
    if (isNaN(ageNum) || ageNum < 0 || ageNum > 150) {
      setError('Age must be between 0 and 150.')
      return
    }
    setLoading(true)
    try {
      const url = isEdit ? `/api/patients/${patientId}` : '/api/patients'
      const method = isEdit ? 'PUT' : 'POST'
      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          age: ageNum,
          gender: gender.trim(),
          phone: phone.trim(),
          address: address.trim(),
          location: location.trim(),
          temperament: temperament.trim() || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to save')
        return
      }
      onSaved()
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6 shadow-sm w-full max-w-2xl">
      <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-4">
        {isEdit ? 'Edit patient' : 'Add patient'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4 w-full">
        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
            {error}
          </p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded border border-slate-300 px-3 py-2.5 sm:py-2 text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 min-h-[44px] sm:min-h-0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Age *</label>
            <input
              type="number"
              min={0}
              max={150}
              value={age}
              onChange={(e) => setAge(e.target.value)}
              required
              className="w-full rounded border border-slate-300 px-3 py-2.5 sm:py-2 text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 min-h-[44px] sm:min-h-0"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Gender *</label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            required
            className="w-full rounded border border-slate-300 px-3 py-2.5 sm:py-2 text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 min-h-[44px] sm:min-h-0"
          >
            <option value="">Select</option>
            {GENDERS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded border border-slate-300 px-3 py-2.5 sm:py-2 text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 min-h-[44px] sm:min-h-0"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full rounded border border-slate-300 px-3 py-2.5 sm:py-2 text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 min-h-[44px] sm:min-h-0"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full rounded border border-slate-300 px-3 py-2.5 sm:py-2 text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 min-h-[44px] sm:min-h-0"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Temperament</label>
          <select
            value={temperament}
            onChange={(e) => setTemperament(e.target.value)}
            className="w-full rounded border border-slate-300 px-3 py-2.5 sm:py-2 text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 min-h-[44px] sm:min-h-0"
          >
            <option value="">Select (optional)</option>
            {TEMPERAMENT_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col-reverse sm:flex-row gap-2">
          <button
            type="submit"
            disabled={loading}
            className="rounded bg-slate-800 text-white px-4 py-3 sm:py-2 text-sm font-medium hover:bg-slate-700 disabled:opacity-50 touch-manipulation w-full sm:w-auto"
          >
            {loading ? 'Saving…' : isEdit ? 'Update' : 'Add patient'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded border border-slate-300 bg-white px-4 py-3 sm:py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 touch-manipulation w-full sm:w-auto"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
