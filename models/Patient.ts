import mongoose from 'mongoose'
import { TEMPERAMENT_OPTIONS } from '@/lib/constants'

const patientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, required: true },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    location: { type: String, default: '' },
    temperament: {
      type: String,
      enum: TEMPERAMENT_OPTIONS,
    },
  },
  { timestamps: true }
)

patientSchema.index({ name: 'text', phone: 'text', location: 'text' })

export default mongoose.models.Patient || mongoose.model('Patient', patientSchema)
