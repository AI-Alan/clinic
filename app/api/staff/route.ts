import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Doctor from '@/models/Doctor'
import { getAuthFromRequest } from '@/lib/auth'
import { canAccessStaff } from '@/lib/rbac'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthFromRequest(request)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!canAccessStaff(auth)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    await connectDB()
    const staff = await Doctor.find({})
      .select('-passwordHash')
      .sort({ role: 1, email: 1 })
      .lean()
    return NextResponse.json(staff)
  } catch (err) {
    console.error('Staff list error:', err)
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
    if (!canAccessStaff(auth)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    await connectDB()
    const body = await request.json()
    const { email, password, role, name } = body
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }
    const validRole = ['admin', 'doctor', 'nurse'].includes(String(role).toLowerCase())
      ? String(role).toLowerCase()
      : 'doctor'
    const existing = await Doctor.findOne({ email: String(email).trim().toLowerCase() })
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 })
    }
    const passwordHash = await bcrypt.hash(String(password), 10)
    const staff = await Doctor.create({
      email: String(email).trim().toLowerCase(),
      passwordHash,
      role: validRole,
      name: String(name ?? '').trim(),
    })
    const out = staff.toObject()
    delete (out as Record<string, unknown>).passwordHash
    return NextResponse.json(out, { status: 201 })
  } catch (err) {
    console.error('Staff create error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
