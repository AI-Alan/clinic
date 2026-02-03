import mongoose from 'mongoose'

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dosage: { type: String, default: '' },
  duration: { type: String, default: '' },
})

const visitSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  date: { type: Date, required: true },
  symptoms: { type: String, default: '' },
  diagnosis: { type: String, default: '' },
  medicines: [medicineSchema],
  notes: { type: String, default: '' },
})

visitSchema.index({ patientId: 1, date: -1 })

export default mongoose.models.Visit || mongoose.model('Visit', visitSchema)
