import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import { connectDB } from '@/lib/db'
import Patient from '@/models/Patient'
import Visit from '@/models/Visit'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid patient id' }, { status: 400 })
    }
    await connectDB()
    const patient = await Patient.findById(id).lean()
    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }
    return NextResponse.json(patient)
  } catch (err) {
    console.error('Patient get error:', err)
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
      return NextResponse.json({ error: 'Invalid patient id' }, { status: 400 })
    }
    await connectDB()
    const body = await request.json()
    const { name, age, gender, phone, address, location, temperament } = body
    const setUpdate: Record<string, unknown> = {}
    if (name !== undefined) setUpdate.name = String(name).trim()
    if (age !== undefined) setUpdate.age = Number(age)
    if (gender !== undefined) setUpdate.gender = String(gender).trim()
    if (phone !== undefined) setUpdate.phone = String(phone).trim()
    if (address !== undefined) setUpdate.address = String(address).trim()
    if (location !== undefined) setUpdate.location = String(location).trim()
    if (temperament !== undefined) {
      const val = temperament ? String(temperament).trim() : null
      if (val) setUpdate.temperament = val
    }
    const updateOp: Record<string, unknown> = setUpdate && Object.keys(setUpdate).length ? { $set: setUpdate } : {}
    if (temperament !== undefined && !(temperament && String(temperament).trim())) {
      updateOp.$unset = { temperament: 1 }
    }
    const patient = await Patient.findByIdAndUpdate(
      id,
      Object.keys(updateOp).length ? updateOp : { $set: {} },
      { new: true, runValidators: true }
    ).lean()
    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }
    return NextResponse.json(patient)
  } catch (err) {
    console.error('Patient update error:', err)
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
      return NextResponse.json({ error: 'Invalid patient id' }, { status: 400 })
    }
    await connectDB()
    const patient = await Patient.findByIdAndDelete(id)
    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }
    // Cascade delete all visits for this patient
    await Visit.deleteMany({ patientId: id })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Patient delete error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
