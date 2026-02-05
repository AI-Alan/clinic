import mongoose from 'mongoose'

const appointmentSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    date: { type: Date, required: true },
    order: { type: Number, default: 0 },
    status: { type: String, enum: ['queued', 'visited'], default: 'queued' },
    addedAt: { type: Date, default: Date.now },
    visitedAt: { type: Date },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
  },
  { timestamps: true }
)

appointmentSchema.index({ date: 1, order: 1 })

export default mongoose.models.Appointment || mongoose.model('Appointment', appointmentSchema)
