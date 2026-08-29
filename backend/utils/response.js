// ============================================================
//  utils/response.js
//  Standardised response helpers for consistent JSON shape.
// ============================================================

'use strict';

const ok = (res, data = {}, status = 200) =>
  res.status(status).json({ success: true, ...data });

const fail = (res, message = 'An error occurred.', status = 400) =>
  res.status(status).json({ success: false, error: message });

const notFound = (res, entity = 'Resource') =>
  res.status(404).json({ success: false, error: `${entity} not found.` });

module.exports = { ok, fail, notFound };
