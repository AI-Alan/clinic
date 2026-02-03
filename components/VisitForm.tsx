'use client'

import { useState } from 'react'

type Medicine = { name: string; dosage: string; duration: string }

type VisitFormProps = {
  patientId: string
  visitId?: string
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

export default function VisitForm({ patientId, visitId, initial, onCancel, onSaved }: VisitFormProps) {
  const isEdit = !!visitId

  const [date, setDate] = useState(
    initial?.date
      ? new Date(initial.date).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16)
  )
  const [symptoms, setSymptoms] = useState(initial?.symptoms ?? '')
  const [diagnosis, setDiagnosis] = useState(initial?.diagnosis ?? '')
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

      if (!isEdit) {
        payload.patientId = patientId
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
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
    <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6 shadow-sm w-full max-w-2xl overflow-hidden">
      <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-4">
        {isEdit ? 'Edit visit' : 'Add visit'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
            {error}
          </p>
        )}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Date & time *</label>
          <input
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full min-w-0 max-w-xs rounded border border-slate-300 px-3 py-2.5 sm:py-2 text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Symptoms</label>
          <textarea
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            rows={2}
            className="w-full rounded border border-slate-300 px-3 py-2 text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Diagnosis</label>
          <textarea
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            rows={2}
            className="w-full rounded border border-slate-300 px-3 py-2 text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-slate-700">Medicines (Homeopathic)</label>
            <button
              type="button"
              onClick={addMedicine}
              className="text-sm text-slate-600 hover:text-slate-900"
            >
              + Add medicine
            </button>
          </div>
          <div className="space-y-2">
            {medicines.map((m, i) => (
              <div key={i} className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 p-2 sm:p-2.5 bg-slate-50 rounded">
                <input
                  type="text"
                  placeholder="Remedy (e.g. Arnica montana)"
                  value={m.name}
                  onChange={(e) => updateMedicine(i, 'name', e.target.value)}
                  className="flex-1 min-w-0 rounded border border-slate-300 px-3 py-2.5 sm:py-1.5 text-sm"
                />
                <input
                  type="text"
                  placeholder="Potency (e.g. 30C, 200C)"
                  value={m.dosage}
                  onChange={(e) => updateMedicine(i, 'dosage', e.target.value)}
                  className="w-full sm:w-28 rounded border border-slate-300 px-3 py-2.5 sm:py-1.5 text-sm min-w-0"
                />
                <input
                  type="text"
                  placeholder="Dosage / Duration (e.g. 4 pills TDS, 7 days)"
                  value={m.duration}
                  onChange={(e) => updateMedicine(i, 'duration', e.target.value)}
                  className="flex-1 min-w-0 rounded border border-slate-300 px-3 py-2.5 sm:py-1.5 text-sm"
                />
                <button
                  type="button"
                  onClick={() => removeMedicine(i)}
                  className="text-slate-500 hover:text-red-600 text-sm py-2 sm:py-1 touch-manipulation self-start sm:self-center"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full rounded border border-slate-300 px-3 py-2 text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
        </div>
        <div className="flex flex-col-reverse sm:flex-row gap-2">
          <button
            type="submit"
            disabled={loading}
            className="rounded bg-slate-800 text-white px-4 py-3 sm:py-2 text-sm font-medium hover:bg-slate-700 disabled:opacity-50 touch-manipulation w-full sm:w-auto"
          >
            {loading ? 'Saving…' : isEdit ? 'Update visit' : 'Add visit'}
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
