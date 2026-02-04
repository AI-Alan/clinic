'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Layout from '@/components/Layout'
import { useAuth } from '@/context/AuthContext'
import StaffForm from '@/components/StaffForm'
import { apiFetch } from '@/lib/apiClient'
import ConfirmDialog from '@/components/ConfirmDialog'

type StaffMember = {
  _id: string
  email: string
  role: string
  name?: string
}

export default function StaffPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<StaffMember | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!user || user.role !== 'admin') {
      router.replace('/dashboard')
      return
    }
    apiFetch('/api/staff')
      .then((res) => {
        if (res.status === 403) {
          router.replace('/dashboard')
          return []
        }
        return res.ok ? res.json() : []
      })
      .then((data) => setStaff(Array.isArray(data) ? data : []))
      .catch(() => setStaff([]))
      .finally(() => setLoading(false))
  }, [user, authLoading, router, showForm, editing])

  function handleSaved() {
    setShowForm(false)
    setEditing(null)
    apiFetch('/api/staff')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setStaff(Array.isArray(data) ? data : []))
  }

  function handleDeleteConfirm() {
    if (!deleteId) return
    setDeleting(true)
    apiFetch(`/api/staff/${deleteId}`, { method: 'DELETE' })
      .then((res) => {
        if (res.ok) handleSaved()
      })
      .finally(() => {
        setDeleting(false)
        setDeleteId(null)
      })
  }

  if (authLoading || (user && user.role !== 'admin')) {
    return (
      <Layout>
        <div className="py-8 text-gray-700 text-base font-bold">Loading…</div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Staff</h1>
        <button
          type="button"
          onClick={() => { setShowForm(true); setEditing(null); }}
          className="btn-primary px-4 py-3 w-full sm:w-auto"
        >
          Add staff
        </button>
      </div>

      {(showForm || editing) && (
        <div className="mb-6">
          <StaffForm
            initial={editing ? { _id: editing._id, email: editing.email, role: editing.role, name: editing.name } : undefined}
            onCancel={() => { setShowForm(false); setEditing(null); }}
            onSaved={handleSaved}
          />
        </div>
      )}

      <div className="bg-white rounded-lg border-2 border-slate-300 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-4 sm:p-8 text-center text-gray-700 text-base font-bold">Loading…</div>
        ) : staff.length === 0 ? (
          <div className="p-4 sm:p-8 text-center text-gray-700 text-base font-bold">No staff yet.</div>
        ) : (
          <ul className="divide-y-2 divide-slate-200">
            {staff.map((s) => (
              <li key={s._id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-3 sm:px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-gray-900 truncate text-base">{s.email}</p>
                  <p className="text-base font-semibold text-gray-700 capitalize">{s.role}</p>
                  {s.name && <p className="text-base font-medium text-gray-700 break-words">{s.name}</p>}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => { setEditing(s); setShowForm(false); }}
                    className="rounded border-2 border-slate-400 bg-white px-4 py-3 text-base font-bold text-gray-800 hover:bg-slate-50 touch-manipulation"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteId(s._id)}
                    disabled={user?.id === s._id}
                    className="rounded border-2 border-red-300 bg-white px-4 py-3 text-base font-bold text-red-700 hover:bg-red-50 disabled:opacity-50 touch-manipulation"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {deleteId && (
        <ConfirmDialog
          title="Delete staff"
          message="Are you sure you want to remove this staff member? They will no longer be able to log in."
          confirmLabel="Delete"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteId(null)}
          isDestructive
          loading={deleting}
        />
      )}
    </Layout>
  )
}
