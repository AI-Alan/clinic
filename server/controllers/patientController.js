const { prisma } = require('../config/db');

async function list(req, res, next) {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = {};
    const searchWhere = search && search.trim() ? {
      OR: [
        { firstName: { contains: search.trim() } },
        { lastName: { contains: search.trim() } },
        { cardNumber: { contains: search.trim() } },
        { email: { contains: search.trim() } },
        { phone: { contains: search.trim() } },
      ],
    } : {};

    const patients = await prisma.patient.findMany({
      where: searchWhere,
      skip,
      take: Number(limit),
      orderBy: { lastName: 'asc' },
    });

    const total = await prisma.patient.count({
      where: searchWhere,
    });

    res.json({ patients, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const patient = await prisma.patient.findUnique({
      where: { id: req.params.id },
    });
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    res.json(patient);
  } catch (err) {
    next(err);
  }
}

const ALLOWED_PATIENT_FIELDS = ['firstName', 'lastName', 'cardNumber', 'issue', 'age'];

function sanitizePatientBody(body) {
  const data = {};
  for (const key of ALLOWED_PATIENT_FIELDS) {
    if (body[key] === undefined || body[key] === null) continue;
    if (key === 'age') {
      const n = parseInt(body[key], 10);
      if (!isNaN(n) && n >= 0 && n <= 150) data[key] = n;
    } else {
      const val = typeof body[key] === 'string' ? body[key].trim() : body[key];
      if (val !== '') data[key] = val;
    }
  }
  return data;
}

async function create(req, res, next) {
  try {
    const data = sanitizePatientBody(req.body);
    const patient = await prisma.patient.create({
      data,
    });
    res.status(201).json(patient);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const data = sanitizePatientBody(req.body);
    const patient = await prisma.patient.update({
      where: { id: req.params.id },
      data,
    });
    res.json(patient);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Patient not found' });
    next(err);
  }
}

async function getAppointments(req, res, next) {
  try {
    const appointments = await prisma.appointment.findMany({
      where: { patientId: req.params.id },
      include: { user: { select: { id: true, name: true } } },
      orderBy: [{ date: 'desc' }, { time: 'asc' }],
    });
    res.json(appointments);
  } catch (err) {
    next(err);
  }
}

async function getVisits(req, res, next) {
  try {
    const visits = await prisma.visit.findMany({
      where: { patientId: req.params.id },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { date: 'desc' },
    });
    res.json(visits);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getOne, create, update, getAppointments, getVisits };
