// ============================================================
//  middleware/errorHandler.js
//  Central error handler — always returns JSON, never leaks
//  stack traces in production.
// ============================================================

'use strict';

function errorHandler(err, req, res, _next) {
  const isDev = process.env.NODE_ENV === 'development';

  // Log full error server-side
  console.error(`[ERROR] ${req.method} ${req.originalUrl}`, err);

  const status  = err.statusCode || err.status || 500;
  const message = err.message   || 'Internal server error.';

  res.status(status).json({
    error:   message,
    ...(isDev && { stack: err.stack }),
  });
}

module.exports = { errorHandler };
