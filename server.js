require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const financialRoutes = require('./routes/financialRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// ──────────────────────────────────────────────────────────
// Connect to MongoDB
// ──────────────────────────────────────────────────────────
connectDB();

// ──────────────────────────────────────────────────────────
// Express App
// ──────────────────────────────────────────────────────────
const app = express();

// Security headers
app.use(helmet());

// CORS — configure origins as needed for production
app.use(cors());

// Request logging (dev only)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body Parsers
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// ──────────────────────────────────────────────────────────
// Health Check
// ──────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Finance Dashboard API is running.',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ──────────────────────────────────────────────────────────
// API Routes
// ──────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/records', financialRoutes);
app.use('/api/dashboard', dashboardRoutes);

// ──────────────────────────────────────────────────────────
// Error Handling (must be last)
// ──────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ──────────────────────────────────────────────────────────
// Start Server
// ──────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT} [${process.env.NODE_ENV}]`);
  console.log(`📡 Health: http://localhost:${PORT}/health`);
  console.log(`🔑 Auth:   http://localhost:${PORT}/api/auth`);
  console.log(`👥 Users:  http://localhost:${PORT}/api/users`);
  console.log(`💰 Records:    http://localhost:${PORT}/api/records`);
  console.log(`📊 Dashboard:  http://localhost:${PORT}/api/dashboard\n`);
});

module.exports = app;
