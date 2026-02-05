import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import { connectDB } from '@/lib/db'
import Appointment from '@/models/Appointment'
import Patient from '@/models/Patient'
import { getAuthFromRequest } from '@/lib/auth'
import { canAddToQueue } from '@/lib/rbac'
import { getApiErrorResponse } from '@/lib/apiError'

export const dynamic = 'force-dynamic'

function startOfDay(d: Date): Date {
  const out = new Date(d)
  out.setUTCHours(0, 0, 0, 0)
  return out
}

function endOfDay(d: Date): Date {
  const out = new Date(d)
  out.setUTCHours(23, 59, 59, 999)
  return out
}

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthFromRequest(request)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { searchParams } = new URL(request.url)
    const dateParam = searchParams.get('date')?.trim()
    const day = dateParam ? new Date(dateParam) : new Date()
    if (isNaN(day.getTime())) {
      return NextResponse.json({ error: 'Invalid date' }, { status: 400 })
    }
    const dateStart = startOfDay(day)
    const dateEnd = endOfDay(day)

    await connectDB()
    const [queued, visited] = await Promise.all([
      Appointment.find({
        date: { $gte: dateStart, $lte: dateEnd },
        status: 'queued',
      })
        .sort({ order: 1, addedAt: 1 })
        .populate('patientId', 'name age gender phone')
        .lean(),
      Appointment.find({
        status: 'visited',
        visitedAt: { $gte: dateStart, $lte: dateEnd },
      })
        .sort({ visitedAt: 1 })
        .populate('patientId', 'name age gender phone')
        .lean(),
    ])

    return NextResponse.json({ queued, visited })
  } catch (err) {
    console.error('Appointments list error:', err)
    const { status, message } = getApiErrorResponse(err)
    return NextResponse.json({ error: message }, { status })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthFromRequest(request)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!canAddToQueue(auth)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    await connectDB()
    const body = await request.json()
    const { patientId, date: dateParam } = body
    if (!patientId) {
      return NextResponse.json({ error: 'patientId is required' }, { status: 400 })
    }
    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      return NextResponse.json({ error: 'Invalid patientId' }, { status: 400 })
    }
    const patient = await Patient.findById(patientId)
    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }

    const day = dateParam ? new Date(dateParam) : new Date()
    if (isNaN(day.getTime())) {
      return NextResponse.json({ error: 'Invalid date' }, { status: 400 })
    }
    const dateStart = startOfDay(day)

    const maxOrder = await Appointment.findOne(
      { date: { $gte: dateStart, $lte: endOfDay(day) } },
      {},
      { sort: { order: -1 } }
    ).select('order').lean()
    const nextOrder = ((maxOrder as { order?: number } | null)?.order ?? -1) + 1

    const appointment = await Appointment.create({
      patientId,
      date: dateStart,
      order: nextOrder,
      status: 'queued',
      addedBy: auth.sub,
    })
    const populated = await Appointment.findById(appointment._id)
      .populate('patientId', 'name age gender phone')
      .lean()
    return NextResponse.json(populated, { status: 201 })
  } catch (err) {
    console.error('Appointment create error:', err)
    const { status, message } = getApiErrorResponse(err)
    return NextResponse.json({ error: message }, { status })
  }
}
