import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import { connectDB } from '@/lib/db'
import Visit from '@/models/Visit'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid visit id' }, { status: 400 })
    }
    await connectDB()
    const visit = await Visit.findById(id).lean()
    if (!visit) {
      return NextResponse.json({ error: 'Visit not found' }, { status: 404 })
    }
    return NextResponse.json(visit)
  } catch (err) {
    console.error('Visit get error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid visit id' }, { status: 400 })
    }
    await connectDB()
    const body = await request.json()
    const { date, symptoms, diagnosis, medicines, notes } = body

    const updateData: Record<string, unknown> = {}
    if (date !== undefined) updateData.date = new Date(date)
    if (symptoms !== undefined) updateData.symptoms = String(symptoms).trim()
    if (diagnosis !== undefined) updateData.diagnosis = String(diagnosis).trim()
    if (notes !== undefined) updateData.notes = String(notes).trim()
    if (medicines !== undefined) {
      updateData.medicines = Array.isArray(medicines)
        ? medicines.map((m: { name?: string; dosage?: string; duration?: string }) => ({
            name: String(m?.name ?? '').trim(),
            dosage: String(m?.dosage ?? '').trim(),
            duration: String(m?.duration ?? '').trim(),
          }))
        : []
    }

    const visit = await Visit.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean()

    if (!visit) {
      return NextResponse.json({ error: 'Visit not found' }, { status: 404 })
    }
    return NextResponse.json(visit)
  } catch (err) {
    console.error('Visit update error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid visit id' }, { status: 400 })
    }
    await connectDB()
    const visit = await Visit.findByIdAndDelete(id)
    if (!visit) {
      return NextResponse.json({ error: 'Visit not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Visit delete error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
