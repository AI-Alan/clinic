const { body, validationResult } = require('express-validator');

// Only: patient name (first, last), card number, issue, age. No dateOfBirth, no demographics.
const createUpdateRules = [
  body('firstName').trim().notEmpty().withMessage('Patient name (first) is required'),
  body('lastName').trim().notEmpty().withMessage('Patient name (last) is required'),
  body('cardNumber').optional({ values: 'falsy' }).trim(),
  body('issue').optional({ values: 'falsy' }).trim(),
  body('age').optional({ values: 'falsy' }).isInt({ min: 0, max: 150 }).withMessage('Age must be 0–150'),
];

function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }
  next();
}

module.exports = { createUpdateRules, handleValidation };
