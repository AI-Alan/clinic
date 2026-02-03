const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const path = require('path')
const fs = require('fs')

// Load env from .env.local or .env (use existing keys if present)
const envLocal = path.join(process.cwd(), '.env.local')
const envFile = path.join(process.cwd(), '.env')
if (fs.existsSync(envLocal)) {
  require('dotenv').config({ path: envLocal })
} else {
  require('dotenv').config({ path: envFile })
}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/clinic'

const doctorSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin', 'doctor', 'nurse'], default: 'doctor' },
  name: { type: String, default: '' },
})
const Doctor = mongoose.models?.Doctor || mongoose.model('Doctor', doctorSchema)

const STAFF = [
  { email: 'admin@clinic.com', password: 'admin123', role: 'admin', name: 'Admin' },
  { email: 'doctor@clinic.com', password: '123456', role: 'doctor', name: 'Doctor' },
  { email: 'nurse@clinic.com', password: 'nurse123', role: 'nurse', name: 'Nurse' },
  { email: 'mauktikrezru@gmail.com', password: 'mauktik@1973', role: 'doctor', name: '' },
]

async function seed() {
  await mongoose.connect(MONGODB_URI)
  // Ensure existing users have a role (backfill)
  await Doctor.updateMany({ role: { $exists: false } }, { $set: { role: 'doctor' } })
  for (const { email, password, role, name } of STAFF) {
    const existing = await Doctor.findOne({ email: email.trim().toLowerCase() })
    if (existing) {
      await Doctor.updateOne(
        { email: existing.email },
        { $set: { role: role || 'doctor', name: name || '' } }
      )
      console.log('Updated staff:', email, 'role:', role)
      continue
    }
    const passwordHash = await bcrypt.hash(password, 10)
    await Doctor.create({
      email: email.trim().toLowerCase(),
      passwordHash,
      role: role || 'doctor',
      name: name || '',
    })
    console.log('Seeded staff:', email, 'role:', role)
  }
  await mongoose.disconnect()
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
