import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import { connectDB } from '@/lib/db'
import Appointment from '@/models/Appointment'
import { getAuthFromRequest } from '@/lib/auth'
import { canManageQueue } from '@/lib/rbac'
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthFromRequest(request)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!canManageQueue(auth)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const { id } = await params
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid appointment id' }, { status: 400 })
    }
    await connectDB()
    const appointment = await Appointment.findById(id)
    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }
    const body = await request.json()
    const { order: newOrder, status: newStatus } = body

    if (newStatus === 'visited') {
      appointment.status = 'visited'
      appointment.visitedAt = new Date()
      await appointment.save()
      const populated = await Appointment.findById(appointment._id)
        .populate('patientId', 'name age gender phone')
        .lean()
      return NextResponse.json(populated)
    }

    if (typeof newOrder === 'number' && newOrder >= 0 && appointment.status === 'queued') {
      const dateStart = startOfDay(appointment.date)
      const dateEnd = endOfDay(appointment.date)
      const allQueued = await Appointment.find({
        date: { $gte: dateStart, $lte: dateEnd },
        status: 'queued',
      })
        .sort({ order: 1, addedAt: 1 })
        .lean()
      const idx = allQueued.findIndex((a) => String((a as { _id: unknown })._id) === id)
      if (idx === -1) {
        const populated = await Appointment.findById(appointment._id)
          .populate('patientId', 'name age gender phone')
          .lean()
        return NextResponse.json(populated)
      }
      const fromIdx = idx
      const toIdx = Math.min(newOrder, allQueued.length - 1)
      if (fromIdx !== toIdx) {
        const item = allQueued[fromIdx]
        const rest = allQueued.filter((_, i) => i !== fromIdx)
        const reordered = [...rest.slice(0, toIdx), item, ...rest.slice(toIdx)]
        for (let i = 0; i < reordered.length; i++) {
          await Appointment.findByIdAndUpdate((reordered[i] as { _id: unknown })._id, { $set: { order: i } })
        }
      }
      const populated = await Appointment.findById(appointment._id)
        .populate('patientId', 'name age gender phone')
        .lean()
      return NextResponse.json(populated)
    }

    return NextResponse.json(appointment.toObject ? appointment.toObject() : appointment)
  } catch (err) {
    console.error('Appointment update error:', err)
    const { status, message } = getApiErrorResponse(err)
    return NextResponse.json({ error: message }, { status })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthFromRequest(request)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!canManageQueue(auth)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const { id } = await params
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid appointment id' }, { status: 400 })
    }
    await connectDB()
    const appointment = await Appointment.findOne({ _id: id, status: 'queued' })
    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found or already visited' },
        { status: 404 }
      )
    }
    await Appointment.findByIdAndDelete(id)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Appointment delete error:', err)
    const { status, message } = getApiErrorResponse(err)
    return NextResponse.json({ error: message }, { status })
  }
}
