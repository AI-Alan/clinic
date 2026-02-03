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
  body('appointmentId').optional(),
  body('chiefComplaint').optional().trim(),
  body('vitals').optional(),
  body('diagnosis').optional().trim(),
  body('notes').optional().trim(),
  body('prescriptions').optional(),
];

// GET /api/visits?patientId= &date=
router.get('/', async (req, res, next) => {
  try {
    const { patientId, date } = req.query;
    const where = {};
    if (patientId) where.patientId = patientId;
    if (date) {
      const d = new Date(date);
      const start = new Date(d.setHours(0, 0, 0, 0));
      const end = new Date(d.setHours(23, 59, 59, 999));
      where.date = { gte: start, lte: end };
    }

    const visits = await prisma.visit.findMany({
      where,
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
        user: { select: { id: true, name: true } },
      },
      orderBy: { date: 'desc' },
    });
    res.json(visits);
  } catch (err) {
    next(err);
  }
});

// GET /api/visits/:id
router.get('/:id', async (req, res, next) => {
  try {
    const visit = await prisma.visit.findUnique({
      where: { id: req.params.id },
      include: {
        patient: true,
        user: { select: { id: true, name: true } },
        appointment: { select: { id: true, date: true, time: true } },
      },
    });
    if (!visit) return res.status(404).json({ error: 'Visit not found' });
    res.json(visit);
  } catch (err) {
    next(err);
  }
});

// POST /api/visits
router.post('/', createUpdateRules, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

    const visit = await prisma.visit.create({
      data: req.body,
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
        user: { select: { id: true, name: true } },
      },
    });
    res.status(201).json(visit);
  } catch (err) {
    next(err);
  }
});

// PUT /api/visits/:id
router.put('/:id', createUpdateRules, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

    const visit = await prisma.visit.update({
      where: { id: req.params.id },
      data: req.body,
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
        user: { select: { id: true, name: true } },
      },
    });
    res.json(visit);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Visit not found' });
    next(err);
  }
});

module.exports = router;
