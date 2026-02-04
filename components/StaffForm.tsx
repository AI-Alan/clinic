'use client'

import { useState } from 'react'
import { apiFetch } from '@/lib/apiClient'

const ROLES = ['admin', 'doctor', 'nurse'] as const

type StaffFormProps = {
  initial?: { _id: string; email: string; role: string; name?: string }
  onCancel: () => void
  onSaved: () => void
}

export default function StaffForm({ initial, onCancel, onSaved }: StaffFormProps) {
  const isEdit = !!initial
  const [email, setEmail] = useState(initial?.email ?? '')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState(initial?.role ?? 'doctor')
  const [name, setName] = useState(initial?.name ?? '')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!email.trim()) {
      setError('Email is required.')
      return
    }
    if (!isEdit && !password) {
      setError('Password is required for new staff.')
      return
    }
    setLoading(true)
    try {
      const url = isEdit ? `/api/staff/${initial._id}` : '/api/staff'
      const method = isEdit ? 'PUT' : 'POST'
      const body: Record<string, string> = {
        email: email.trim(),
        role,
        name: name.trim(),
      }
      if (!isEdit) body.password = password
      else if (password) body.password = password
      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
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
    <div className="bg-white rounded-lg border-2 border-slate-300 p-4 sm:p-6 shadow-sm w-full max-w-md overflow-hidden">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
        {isEdit ? 'Edit staff' : 'Add staff'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="text-base font-semibold text-red-700 bg-red-50 border-2 border-red-300 rounded px-3 py-2">
            {error}
          </p>
        )}
        <div>
          <label className="block text-base font-bold text-gray-800 mb-1.5">Email *</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isEdit}
            className="input-accent w-full disabled:bg-slate-100"
          />
          {isEdit && <p className="text-sm text-slate-500 mt-1">Email cannot be changed.</p>}
        </div>
        <div>
          <label className="block text-base font-bold text-gray-800 mb-1.5">
            Password {isEdit ? '(leave blank to keep)' : '*'}
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required={!isEdit}
            minLength={6}
            className="input-accent w-full"
          />
        </div>
        <div>
          <label className="block text-base font-bold text-gray-800 mb-1.5">Role *</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="input-accent w-full"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-base font-bold text-gray-800 mb-1.5">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-accent w-full"
          />
        </div>
        <div className="flex flex-col-reverse sm:flex-row gap-2">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary px-4 py-3 w-full sm:w-auto"
          >
            {loading ? 'Saving…' : isEdit ? 'Update' : 'Add'}
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
