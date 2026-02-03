import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import { connectDB } from '@/lib/db'
import Doctor from '@/models/Doctor'
import { getAuthFromRequest } from '@/lib/auth'
import { canAccessStaff } from '@/lib/rbac'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthFromRequest(request)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!canAccessStaff(auth)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const { id } = await params
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid staff id' }, { status: 400 })
    }
    await connectDB()
    const staff = await Doctor.findById(id).select('-passwordHash').lean()
    if (!staff) return NextResponse.json({ error: 'Staff not found' }, { status: 404 })
    return NextResponse.json(staff)
  } catch (err) {
    console.error('Staff get error:', err)
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
    const auth = await getAuthFromRequest(request)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!canAccessStaff(auth)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const { id } = await params
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid staff id' }, { status: 400 })
    }
    await connectDB()
    const body = await request.json()
    const { email, password, role, name } = body
    const update: Record<string, unknown> = {}
    if (email !== undefined) update.email = String(email).trim().toLowerCase()
    if (role !== undefined && ['admin', 'doctor', 'nurse'].includes(String(role).toLowerCase())) {
      update.role = String(role).toLowerCase()
    }
    if (name !== undefined) update.name = String(name).trim()
    if (password !== undefined && String(password).trim()) {
      update.passwordHash = await bcrypt.hash(String(password).trim(), 10)
    }
    const staff = await Doctor.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true, runValidators: true }
    )
      .select('-passwordHash')
      .lean()
    if (!staff) return NextResponse.json({ error: 'Staff not found' }, { status: 404 })
    return NextResponse.json(staff)
  } catch (err) {
    console.error('Staff update error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthFromRequest(request)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!canAccessStaff(auth)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const { id } = await params
    if (auth.sub === id) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid staff id' }, { status: 400 })
    }
    await connectDB()
    const staff = await Doctor.findByIdAndDelete(id)
    if (!staff) return NextResponse.json({ error: 'Staff not found' }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Staff delete error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
