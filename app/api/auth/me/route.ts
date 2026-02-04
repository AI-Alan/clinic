import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken, COOKIE_NAME } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import Doctor from '@/models/Doctor'

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value ?? null
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const auth = await verifyToken(token)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  await connectDB()
  const doctor = await Doctor.findById(auth.sub).select('name').lean()
  const name = (doctor as { name?: string } | null)?.name ?? ''
  return NextResponse.json({
    id: auth.sub,
    email: auth.email,
    role: auth.role,
    name: name || undefined,
  })
}
