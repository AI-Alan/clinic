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

  function loadPatient() {
    setLoading(true)
    fetch(`/api/patients/${id}`, { cache: 'no-store', credentials: 'include' })
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
    fetch(`/api/visits?patientId=${id}`, { cache: 'no-store', credentials: 'include' })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setVisits(Array.isArray(data) ? data : []))
      .catch(() => setVisits([]))
  }

  useEffect(() => {
    loadPatient()
    loadVisits()
  }, [id])

  function handleDeletePatient() {
    setDeleting(true)
    fetch(`/api/patients/${id}`, { method: 'DELETE' })
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
    fetch(`/api/visits/${deleteVisitId}`, { method: 'DELETE' })
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
    loadVisits()
  }

  if (loading || !patient) {
    return (
      <Layout>
        <div className="py-8 text-slate-500">Loading…</div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="mb-4">
        <Link
          href="/patients"
          className="text-sm text-slate-600 hover:text-slate-900 py-2 inline-block touch-manipulation"
        >
          ← Back to patients
        </Link>
      </div>

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
              temperament: patient.temperament,
            }}
            patientId={patient._id}
            onCancel={() => setEditMode(false)}
            onSaved={() => {
              setEditMode(false)
              loadPatient()
            }}
          />
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6 sm:mb-8">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 break-words">{patient.name}</h1>
              <p className="text-slate-600 mt-1 text-sm sm:text-base">
                {patient.age} years · {patient.gender}
              </p>
              {patient.phone && (
                <p className="text-slate-600 text-sm sm:text-base break-all">Phone: {patient.phone}</p>
              )}
              {patient.location && (
                <p className="text-slate-600 text-sm sm:text-base break-words">Location: {patient.location}</p>
              )}
              {patient.address && (
                <p className="text-slate-600 text-sm sm:text-base break-words">Address: {patient.address}</p>
              )}
            </div>
            {canEdit && (
              <div className="flex gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setEditMode(true)}
                  className="rounded border border-slate-300 bg-white px-4 py-3 sm:py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 touch-manipulation flex-1 sm:flex-none"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setDeletePatientConfirm(true)}
                  className="rounded border border-red-200 bg-white px-4 py-3 sm:py-2 text-sm font-medium text-red-700 hover:bg-red-50 touch-manipulation flex-1 sm:flex-none"
                >
                  Delete
                </button>
              </div>
            )}
          </div>

          <section className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <h2 className="text-base sm:text-lg font-semibold text-slate-900">Visit history</h2>
              {canEditVisit && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingVisit(null)
                    setShowVisitForm(true)
                  }}
                  className="rounded bg-slate-800 text-white px-4 py-3 sm:py-2 text-sm font-medium hover:bg-slate-700 touch-manipulation w-full sm:w-auto"
                >
                  Add visit
                </button>
              )}
            </div>

            {canEditVisit && showVisitForm && (
              <div className="mb-6">
                <VisitForm
                  patientId={id}
                  visitId={editingVisit?._id}
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
          message={`Are you sure you want to delete ${patient.name}? This will also delete all their visit records. This action cannot be undone.`}
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
