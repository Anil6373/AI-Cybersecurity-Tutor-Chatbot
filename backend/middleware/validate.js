// ============================================================
//  middleware/validate.js
//  Wraps express-validator's validationResult into a clean
//  400 response if any validation errors exist.
// ============================================================

'use strict';

const { validationResult } = require('express-validator');

/**
 * handleValidation — call this after your express-validator chains.
 * Returns 400 with a structured error list on failure.
 */
function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error:  'Validation failed.',
      fields: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
}

module.exports = { handleValidation };
