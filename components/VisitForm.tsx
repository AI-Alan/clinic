'use client'

import { useState } from 'react'
import { apiFetch } from '@/lib/apiClient'
import { TEMPERAMENT_OPTIONS } from '@/lib/constants'

type Medicine = { name: string; dosage: string; duration: string }

type VisitFormProps = {
  patientId: string
  visitId?: string
  /** Current patient temperament (stored on patient, can be set/updated from this form) */
  patientTemperament?: string
  initial?: {
    date: string
    symptoms: string
    diagnosis: string
    notes: string
    medicines: Medicine[]
  }
  onCancel: () => void
  onSaved: () => void
}

export default function VisitForm({ patientId, visitId, patientTemperament = '', initial, onCancel, onSaved }: VisitFormProps) {
  const isEdit = !!visitId

  const [date, setDate] = useState(
    initial?.date
      ? new Date(initial.date).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16)
  )
  const [symptoms, setSymptoms] = useState(initial?.symptoms ?? '')
  const [diagnosis, setDiagnosis] = useState(initial?.diagnosis ?? '')
  const [temperament, setTemperament] = useState(patientTemperament ?? '')
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [medicines, setMedicines] = useState<Medicine[]>(
    initial?.medicines?.length
      ? initial.medicines
      : [{ name: '', dosage: '', duration: '' }]
  )
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function addMedicine() {
    setMedicines((m) => [...m, { name: '', dosage: '', duration: '' }])
  }

  function updateMedicine(i: number, field: keyof Medicine, value: string) {
    setMedicines((m) => {
      const next = [...m]
      next[i] = { ...next[i], [field]: value }
      return next
    })
  }

  function removeMedicine(i: number) {
    setMedicines((m) => m.filter((_, idx) => idx !== i))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const url = isEdit ? `/api/visits/${visitId}` : '/api/visits'
      const method = isEdit ? 'PUT' : 'POST'

      const payload: Record<string, unknown> = {
        date: new Date(date).toISOString(),
        symptoms: symptoms.trim(),
        diagnosis: diagnosis.trim(),
        notes: notes.trim(),
        medicines: medicines
          .filter((m) => m.name.trim())
          .map((m) => ({
            name: m.name.trim(),
            dosage: m.dosage.trim(),
            duration: m.duration.trim(),
          })),
      }
      if (temperament.trim()) payload.temperament = temperament.trim()

      if (!isEdit) {
        payload.patientId = patientId
      }

      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || `Failed to ${isEdit ? 'update' : 'add'} visit`)
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
    <div className="bg-white rounded-lg border-2 border-slate-300 p-4 sm:p-6 shadow-sm w-full max-w-5xl mx-auto overflow-hidden">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
        {isEdit ? 'Edit visit' : 'Add visit'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="text-base font-semibold text-red-700 bg-red-50 border-2 border-red-300 rounded px-3 py-2">
            {error}
          </p>
        )}
        <div>
          <label className="block text-base font-bold text-gray-800 mb-1.5">Date & time *</label>
          <input
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="input-accent w-full min-w-0 sm:max-w-xs"
          />
        </div>
        <div>
          <label className="block text-base font-bold text-gray-800 mb-1.5">Symptoms</label>
          <textarea
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            rows={2}
            className="input-accent w-full"
          />
        </div>
        <div>
          <label className="block text-base font-bold text-gray-800 mb-1.5">Diagnosis</label>
          <textarea
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            rows={2}
            className="input-accent w-full"
          />
        </div>
        <div>
          <label className="block text-base font-bold text-gray-800 mb-1.5">Temperament (saved on patient; applies to all visits until changed)</label>
          <select
            value={temperament}
            onChange={(e) => setTemperament(e.target.value)}
            className="input-accent w-full"
          >
            <option value="">Select (optional)</option>
            {TEMPERAMENT_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-base font-bold text-gray-800">Medicines (Homeopathic)</label>
            <button
              type="button"
              onClick={addMedicine}
              className="text-base font-bold text-gray-700 hover:text-gray-900 py-2 touch-manipulation"
            >
              + Add medicine
            </button>
          </div>
          <div className="space-y-3">
            {medicines.map((m, i) => (
              <div key={i} className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 p-4 bg-slate-50 rounded-lg border-2 border-slate-200">
                <input
                  type="text"
                  placeholder="Remedy (e.g. Arnica montana)"
                  value={m.name}
                  onChange={(e) => updateMedicine(i, 'name', e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addMedicine()
                    }
                  }}
                  className="input-accent flex-1 min-w-0"
                />
                <input
                  type="text"
                  placeholder="Potency (e.g. 30C, 200C)"
                  value={m.dosage}
                  onChange={(e) => updateMedicine(i, 'dosage', e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addMedicine()
                    }
                  }}
                  className="input-accent w-full sm:w-36 min-w-0"
                />
                <input
                  type="text"
                  placeholder="Dosage / Duration (e.g. 4 pills TDS, 7 days)"
                  value={m.duration}
                  onChange={(e) => updateMedicine(i, 'duration', e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addMedicine()
                    }
                  }}
                  className="input-accent flex-1 min-w-0"
                />
                <button
                  type="button"
                  onClick={() => removeMedicine(i)}
                  className="text-gray-700 hover:text-red-700 text-base font-bold py-3 px-3 touch-manipulation self-start sm:self-center"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-base font-bold text-gray-800 mb-1.5">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="input-accent w-full"
          />
        </div>
        <div className="flex flex-col-reverse sm:flex-row gap-2">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary px-4 py-3 w-full sm:w-auto"
          >
            {loading ? 'Saving…' : isEdit ? 'Update visit' : 'Add visit'}
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
