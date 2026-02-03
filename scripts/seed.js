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
})
const Doctor = mongoose.models?.Doctor || mongoose.model('Doctor', doctorSchema)

const DOCTORS = [
  { email: 'doctor@clinic.com', password: '123456' },
  { email: 'mauktikrezru@gmail.com', password: 'mauktik@1973' },
]

async function seed() {
  await mongoose.connect(MONGODB_URI)
  for (const { email, password } of DOCTORS) {
    const existing = await Doctor.findOne({ email })
    if (existing) {
      console.log('Doctor already exists:', email)
      continue
    }
    const passwordHash = await bcrypt.hash(password, 10)
    await Doctor.create({ email, passwordHash })
    console.log('Seeded doctor:', email)
  }
  await mongoose.disconnect()
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
