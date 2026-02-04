'use client'

import { useState } from 'react'
import { GENDERS } from '@/lib/constants'
import { apiFetch } from '@/lib/apiClient'

type PatientFormProps = {
  initial?: {
    name: string
    age: number
    gender: string
    phone?: string
    address?: string
    location?: string
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
    <div className="bg-white rounded-lg border-2 border-slate-300 p-4 sm:p-6 shadow-sm w-full max-w-2xl">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
        {isEdit ? 'Edit patient' : 'Add patient'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4 w-full">
        {error && (
          <p className="text-base font-semibold text-red-700 bg-red-50 border-2 border-red-300 rounded px-3 py-2">
            {error}
          </p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-base font-bold text-gray-800 mb-1.5">Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="input-accent w-full"
            />
          </div>
          <div>
            <label className="block text-base font-bold text-gray-800 mb-1.5">Age *</label>
            <input
              type="number"
              min={0}
              max={150}
              value={age}
              onChange={(e) => setAge(e.target.value)}
              required
              className="input-accent w-full"
            />
          </div>
        </div>
        <div>
          <label className="block text-base font-bold text-gray-800 mb-1.5">Gender *</label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            required
            className="input-accent w-full"
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
          <label className="block text-base font-bold text-gray-800 mb-1.5">Phone</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="input-accent w-full"
          />
        </div>
        <div>
          <label className="block text-base font-bold text-gray-800 mb-1.5">Address</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="input-accent w-full"
          />
        </div>
        <div>
          <label className="block text-base font-bold text-gray-800 mb-1.5">Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="input-accent w-full"
          />
        </div>
        <div className="flex flex-col-reverse sm:flex-row gap-2">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary px-4 py-3 w-full sm:w-auto"
          >
            {loading ? 'Saving…' : isEdit ? 'Update' : 'Add patient'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded border-2 border-slate-400 bg-white px-4 py-3 text-base font-bold text-gray-800 hover:bg-slate-50 touch-manipulation w-full sm:w-auto"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
