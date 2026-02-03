import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/db'
import Doctor from '@/models/Doctor'
import { createToken, getAuthCookieConfig } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      )
    }
    await connectDB()
    const doctor = await Doctor.findOne({ email: email.trim().toLowerCase() })
    if (!doctor) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }
    const valid = await bcrypt.compare(password, doctor.passwordHash)
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }
    const token = await createToken({
      sub: doctor._id.toString(),
      email: doctor.email,
    })
    const config = getAuthCookieConfig()
    const res = NextResponse.json({ success: true })
    res.cookies.set({ ...config, value: token })
    return res
  } catch (err) {
    console.error('Login error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
