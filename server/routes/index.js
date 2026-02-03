const express = require('express');
const authRoutes = require('./auth');
const usersRoutes = require('./users');
const patientsRoutes = require('./patients');
const appointmentsRoutes = require('./appointments');
const visitsRoutes = require('./visits');

const router = express.Router();

router.get('/', (req, res) => res.send('Server is running'));

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/patients', patientsRoutes);
router.use('/appointments', appointmentsRoutes);
router.use('/visits', visitsRoutes);

module.exports = router;
