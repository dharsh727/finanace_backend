/**
 * Global error handler middleware.
 * Must be registered LAST in the express app, after all routes.
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Mongoose: Duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    message = `${field ? `'${field}'` : 'A field'} already exists with that value.`;
    statusCode = 409;
  }

  // Mongoose: Cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    message = `Invalid value for field '${err.path}': ${err.value}`;
    statusCode = 400;
  }

  // Mongoose: Validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    message = messages.join(', ');
    statusCode = 422;
  }

  // JWT errors (should be caught in auth middleware, but fallback)
  if (err.name === 'JsonWebTokenError') {
    message = 'Invalid token.';
    statusCode = 401;
  }

  if (err.name === 'TokenExpiredError') {
    message = 'Token has expired.';
    statusCode = 401;
  }

  const response = {
    success: false,
    message,
  };

  // Attach stack trace only in development
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

/**
 * 404 handler for unknown routes
 */
const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

module.exports = { errorHandler, notFound };
