import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Patient from '@/models/Patient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')?.trim()
    const gender = searchParams.get('gender')?.trim()
    const ageMin = searchParams.get('ageMin')
    const ageMax = searchParams.get('ageMax')
    const dateFrom = searchParams.get('dateFrom')?.trim()
    const dateTo = searchParams.get('dateTo')?.trim()
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') ?? '10', 10)))

    const query: Record<string, unknown> = {}

    // Partial search using regex (case-insensitive)
    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const regex = { $regex: escaped, $options: 'i' }
      query.$or = [
        { name: regex },
        { phone: regex },
        { location: regex },
      ]
    }

    if (gender) query.gender = gender

    const ageMinNum = ageMin != null && ageMin !== '' ? Number(ageMin) : NaN
    const ageMaxNum = ageMax != null && ageMax !== '' ? Number(ageMax) : NaN
    if (!isNaN(ageMinNum) || !isNaN(ageMaxNum)) {
      query.age = {}
      if (!isNaN(ageMinNum)) (query.age as Record<string, number>).$gte = ageMinNum
      if (!isNaN(ageMaxNum)) (query.age as Record<string, number>).$lte = ageMaxNum
    }

    const fromDate = dateFrom ? new Date(dateFrom) : null
    const toDate = dateTo ? new Date(dateTo) : null
    if (fromDate && !isNaN(fromDate.getTime())) {
      query.createdAt = (query.createdAt as Record<string, Date>) || {}
      ;(query.createdAt as Record<string, Date>).$gte = fromDate
    }
    if (toDate && !isNaN(toDate.getTime())) {
      toDate.setHours(23, 59, 59, 999)
      query.createdAt = (query.createdAt as Record<string, Date>) || {}
      ;(query.createdAt as Record<string, Date>).$lte = toDate
    }

    const skip = (page - 1) * limit
    const [patients, total] = await Promise.all([
      Patient.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Patient.countDocuments(query),
    ])
    const totalPages = Math.ceil(total / limit)
    const res = NextResponse.json({ patients, total, page, limit, totalPages })
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
    return res
  } catch (err) {
    console.error('Patients list error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()
    const { name, age, gender, phone, address, location, temperament } = body
    if (!name || age == null || !gender) {
      return NextResponse.json(
        { error: 'Name, age and gender are required' },
        { status: 400 }
      )
    }
    const patient = await Patient.create({
      name: String(name).trim(),
      age: Number(age),
      gender: String(gender).trim(),
      phone: String(phone ?? '').trim(),
      address: String(address ?? '').trim(),
      location: String(location ?? '').trim(),
      ...(temperament ? { temperament: String(temperament).trim() } : {}),
    })
    return NextResponse.json(patient, { status: 201 })
  } catch (err) {
    console.error('Patient create error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
