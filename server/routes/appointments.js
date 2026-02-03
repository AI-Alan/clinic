const express = require('express');
const { body, validationResult } = require('express-validator');
const { prisma } = require('../config/db');
const { auth } = require('../middleware/auth');

const router = express.Router();
router.use(auth);

const createUpdateRules = [
  body('patientId').notEmpty(),
  body('userId').notEmpty(),
  body('date').isISO8601(),
  body('time').trim().notEmpty(),
  body('status').optional().isIn(['scheduled', 'cancelled', 'completed', 'no-show']),
  body('reason').optional().trim(),
  body('notes').optional().trim(),
];

// GET /api/appointments?date= &userId= &status=
router.get('/', async (req, res, next) => {
  try {
    const { date, userId, status } = req.query;
    const where = {};
    if (date) {
      const d = new Date(date);
      const start = new Date(d.setHours(0, 0, 0, 0));
      const end = new Date(d.setHours(23, 59, 59, 999));
      where.date = { gte: start, lte: end };
    }
    if (userId) where.userId = userId;
    if (status) where.status = status;

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
        user: { select: { id: true, name: true } },
      },
      orderBy: [{ date: 'asc' }, { time: 'asc' }],
    });
    res.json(appointments);
  } catch (err) {
    next(err);
  }
});

// POST /api/appointments
router.post('/', createUpdateRules, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

    const data = { ...req.body, status: req.body.status || 'scheduled' };
    const appointment = await prisma.appointment.create({
      data,
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
        user: { select: { id: true, name: true } },
      },
    });
    res.status(201).json(appointment);
  } catch (err) {
    next(err);
  }
});

// PUT /api/appointments/:id
router.put('/:id', createUpdateRules, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

    const appointment = await prisma.appointment.update({
      where: { id: req.params.id },
      data: req.body,
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
        user: { select: { id: true, name: true } },
      },
    });
    res.json(appointment);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Appointment not found' });
    next(err);
  }
});

// GET /api/appointments/:id
router.get('/:id', async (req, res, next) => {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: req.params.id },
      include: {
        patient: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });
    res.json(appointment);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
