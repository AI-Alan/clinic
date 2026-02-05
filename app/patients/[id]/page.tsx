'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Layout from '@/components/Layout'
import PatientForm from '@/components/PatientForm'
import VisitForm from '@/components/VisitForm'
import VisitTimeline from '@/components/VisitTimeline'
import ConfirmDialog from '@/components/ConfirmDialog'
import PrintPrescription from '@/components/PrintPrescription'
import { useAuth, canEditPatients, canEditVisits } from '@/context/AuthContext'
import { apiFetch } from '@/lib/apiClient'
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

type Visit = {
  _id: string
  date: string
  symptoms: string
  diagnosis: string
  medicines: { name: string; dosage: string; duration: string }[]
  notes: string
}

export default function PatientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const canEdit = canEditPatients(user?.role)
  const canEditVisit = canEditVisits(user?.role)
  const id = params.id as string
  const [patient, setPatient] = useState<Patient | null>(null)
  const [visits, setVisits] = useState<Visit[]>([])
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [showVisitForm, setShowVisitForm] = useState(false)
  const [editingVisit, setEditingVisit] = useState<Visit | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Confirmation dialogs
  const [deletePatientConfirm, setDeletePatientConfirm] = useState(false)
  const [deleteVisitId, setDeleteVisitId] = useState<string | null>(null)
  const [deletingVisit, setDeletingVisit] = useState(false)

  // Print prescription
  const [printVisit, setPrintVisit] = useState<Visit | null>(null)

  // Success message (auto-hide after 3s)
  const [successMessage, setSuccessMessage] = useState('')

  function loadPatient() {
    setLoading(true)
    apiFetch(`/api/patients/${id}`, { cache: 'no-store' })
      .then((res) => {
        if (res.status === 404) {
          router.push('/patients')
          return null
        }
        return res.ok ? res.json() : null
      })
      .then((data) => {
        if (data) setPatient(data)
        else setPatient(null)
      })
      .catch(() => setPatient(null))
      .finally(() => setLoading(false))
  }

  function loadVisits() {
    apiFetch(`/api/visits?patientId=${id}`, { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setVisits(Array.isArray(data) ? data : []))
      .catch(() => setVisits([]))
  }

  useEffect(() => {
    loadPatient()
    loadVisits()
  }, [id])

  useEffect(() => {
    if (!successMessage) return
    const t = setTimeout(() => setSuccessMessage(''), 3000)
    return () => clearTimeout(t)
  }, [successMessage])

  function handleDeletePatient() {
    setDeleting(true)
    apiFetch(`/api/patients/${id}`, { method: 'DELETE' })
      .then((res) => {
        if (res.ok) router.push('/patients')
      })
      .finally(() => {
        setDeleting(false)
        setDeletePatientConfirm(false)
      })
  }

  function handleDeleteVisit() {
    if (!deleteVisitId) return
    setDeletingVisit(true)
    apiFetch(`/api/visits/${deleteVisitId}`, { method: 'DELETE' })
      .then((res) => {
        if (res.ok) loadVisits()
      })
      .finally(() => {
        setDeletingVisit(false)
        setDeleteVisitId(null)
      })
  }

  function handleEditVisit(visit: Visit) {
    setEditingVisit(visit)
    setShowVisitForm(true)
  }

  function handleVisitSaved() {
    setShowVisitForm(false)
    setEditingVisit(null)
    setSuccessMessage('Visit saved.')
    loadVisits()
    loadPatient()
  }

  if (loading || !patient) {
    return (
      <Layout>
        <div className="py-8 text-gray-700 text-base font-bold">Loading…</div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="mb-4">
        <Link
          href="/patients"
          className="btn-primary inline-flex items-center px-4 py-3 min-h-[44px]"
        >
          ← Back to patients
        </Link>
      </div>

      {successMessage && (
        <div className="mb-4 rounded-lg bg-green-100 border-2 border-green-400 px-4 py-3 text-base font-bold text-green-800" role="alert">
          {successMessage}
        </div>
      )}

      {editMode && canEdit ? (
        <div className="mb-8">
          <PatientForm
            initial={{
              name: patient.name,
              age: patient.age,
              gender: patient.gender,
              phone: patient.phone,
              address: patient.address,
              location: patient.location,
            }}
            patientId={patient._id}
            onCancel={() => setEditMode(false)}
            onSaved={() => {
              setEditMode(false)
              setSuccessMessage('Patient updated.')
              loadPatient()
            }}
          />
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6 sm:mb-8">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 break-words">{toTitleCase(patient.name)}</h1>
              <p className="text-gray-700 mt-1 text-base font-semibold">
                {patient.age} years · {toTitleCase(patient.gender)}
              </p>
              {patient.phone && (
                <p className="text-gray-700 text-base font-medium break-all">Phone: {patient.phone}</p>
              )}
              {patient.location && (
                <p className="text-gray-700 text-base font-medium break-words">Location: {toTitleCase(patient.location)}</p>
              )}
              {patient.address && (
                <p className="text-gray-700 text-base font-medium break-words">Address: {toTitleCase(patient.address)}</p>
              )}
              {patient.temperament && (
                <p className="text-gray-700 text-base font-medium">Temperament: {patient.temperament}</p>
              )}
            </div>
            {canEdit && (
              <div className="flex gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setEditMode(true)}
                  className="rounded border-2 border-slate-400 bg-white px-4 py-3 text-base font-bold text-gray-800 hover:bg-slate-50 touch-manipulation flex-1 sm:flex-none"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setDeletePatientConfirm(true)}
                  className="rounded border-2 border-red-300 bg-white px-4 py-3 text-base font-bold text-red-700 hover:bg-red-50 touch-manipulation flex-1 sm:flex-none"
                >
                  Delete
                </button>
              </div>
            )}
          </div>

          <section className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Visit history</h2>
              {canEditVisit && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingVisit(null)
                    setShowVisitForm(true)
                  }}
                  className="btn-primary px-4 py-3 w-full sm:w-auto"
                >
                  Add visit
                </button>
              )}
            </div>

            {canEditVisit && showVisitForm && (
              <div className="mb-6 flex justify-center">
                <VisitForm
                  patientId={id}
                  visitId={editingVisit?._id}
                  patientTemperament={patient.temperament ?? ''}
                  initial={editingVisit ? {
                    date: editingVisit.date,
                    symptoms: editingVisit.symptoms,
                    diagnosis: editingVisit.diagnosis,
                    medicines: editingVisit.medicines,
                    notes: editingVisit.notes,
                  } : undefined}
                  onCancel={() => {
                    setShowVisitForm(false)
                    setEditingVisit(null)
                  }}
                  onSaved={handleVisitSaved}
                />
              </div>
            )}

            <VisitTimeline
              visits={visits}
              onEdit={canEditVisit ? handleEditVisit : undefined}
              onDelete={canEditVisit ? (visitId) => setDeleteVisitId(visitId) : undefined}
              onPrint={(visit) => setPrintVisit(visit)}
            />
          </section>
        </>
      )}

      {/* Delete patient confirmation */}
      {deletePatientConfirm && (
        <ConfirmDialog
          title="Delete Patient"
          message={`Are you sure you want to delete ${toTitleCase(patient.name)}? This will also delete all their visit records. This action cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={handleDeletePatient}
          onCancel={() => setDeletePatientConfirm(false)}
          isDestructive
          loading={deleting}
        />
      )}

      {/* Delete visit confirmation */}
      {deleteVisitId && (
        <ConfirmDialog
          title="Delete Visit"
          message="Are you sure you want to delete this visit record? This action cannot be undone."
          confirmLabel="Delete"
          onConfirm={handleDeleteVisit}
          onCancel={() => setDeleteVisitId(null)}
          isDestructive
          loading={deletingVisit}
        />
      )}

      {/* Print prescription modal */}
      {printVisit && patient && (
        <PrintPrescription
          patient={{
            name: patient.name,
            age: patient.age,
            gender: patient.gender,
            phone: patient.phone,
            address: patient.address,
          }}
          visit={printVisit}
          onClose={() => setPrintVisit(null)}
        />
      )}
    </Layout>
  )
}
