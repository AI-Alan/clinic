import mongoose from 'mongoose'

export const ROLES = ['admin', 'doctor', 'nurse'] as const
export type Role = (typeof ROLES)[number]

const doctorSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: {
    type: String,
    enum: ROLES,
    default: 'doctor',
  },
  name: { type: String, default: '' },
})

export default mongoose.models.Doctor || mongoose.model('Doctor', doctorSchema)
