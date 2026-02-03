import mongoose from 'mongoose'

const doctorSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
})

export default mongoose.models.Doctor || mongoose.model('Doctor', doctorSchema)
