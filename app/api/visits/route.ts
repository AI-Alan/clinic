import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import { connectDB } from '@/lib/db'
import Visit from '@/models/Visit'
import Patient from '@/models/Patient'
import { getAuthFromRequest } from '@/lib/auth'
import { canEditVisits } from '@/lib/rbac'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthFromRequest(request)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get('patientId')
    if (!patientId) {
      return NextResponse.json(
        { error: 'patientId query is required' },
        { status: 400 }
      )
    }
    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      return NextResponse.json({ error: 'Invalid patientId' }, { status: 400 })
    }
    await connectDB()
    const patient = await Patient.findById(patientId)
    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }
    const visits = await Visit.find({ patientId })
      .sort({ date: -1 })
      .lean()
    return NextResponse.json(visits)
  } catch (err) {
    console.error('Visits list error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthFromRequest(request)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!canEditVisits(auth)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    await connectDB()
    const body = await request.json()
    const { patientId, date, symptoms, diagnosis, medicines, notes } = body
    if (!patientId || !date) {
      return NextResponse.json(
        { error: 'patientId and date are required' },
        { status: 400 }
      )
    }
    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      return NextResponse.json({ error: 'Invalid patientId' }, { status: 400 })
    }
    const patient = await Patient.findById(patientId)
    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }
    const meds = Array.isArray(medicines)
      ? medicines.map((m: { name?: string; dosage?: string; duration?: string }) => ({
          name: String(m?.name ?? '').trim(),
          dosage: String(m?.dosage ?? '').trim(),
          duration: String(m?.duration ?? '').trim(),
        }))
      : []
    const visit = await Visit.create({
      patientId,
      date: new Date(date),
      symptoms: String(symptoms ?? '').trim(),
      diagnosis: String(diagnosis ?? '').trim(),
      medicines: meds,
      notes: String(notes ?? '').trim(),
    })
    return NextResponse.json(visit, { status: 201 })
  } catch (err) {
    console.error('Visit create error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
