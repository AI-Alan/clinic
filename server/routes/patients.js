const express = require('express');
const { auth } = require('../middleware/auth');
const patientController = require('../controllers/patientController');
const { createUpdateRules, handleValidation } = require('../middleware/validatePatient');

const router = express.Router();
router.use(auth);

// Strip any dateOfBirth/demographics so only name, cardNumber, issue, age are validated and saved
function stripPatientBody(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    const allowed = ['firstName', 'lastName', 'cardNumber', 'issue', 'age'];
    const stripped = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) stripped[key] = req.body[key];
    }
    req.body = stripped;
  }
  next();
}

router.get('/', patientController.list);
router.get('/:id', patientController.getOne);
router.post('/', stripPatientBody, createUpdateRules, handleValidation, patientController.create);
router.put('/:id', stripPatientBody, createUpdateRules, handleValidation, patientController.update);
router.get('/:id/appointments', patientController.getAppointments);
router.get('/:id/visits', patientController.getVisits);

module.exports = router;
