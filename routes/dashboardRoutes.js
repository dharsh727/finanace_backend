const express = require('express');
const { query } = require('express-validator');
const dashboardController = require('../controllers/dashboardController');
const { authenticate } = require('../middleware/auth');
const { analystAndAbove } = require('../middleware/rbac');
const { validate } = require('../middleware/validate');

const router = express.Router();

// All dashboard routes require authentication + at least analyst role
router.use(authenticate, analystAndAbove);

/**
 * @route   GET /api/dashboard/summary
 * @desc    Total income, total expenses, net balance
 * @access  Analyst, Admin
 */
router.get('/summary', dashboardController.getSummary);

/**
 * @route   GET /api/dashboard/categories
 * @desc    Category-wise totals (optionally filter by type)
 * @access  Analyst, Admin
 * @query   type (income|expense)
 */
router.get(
  '/categories',
  [query('type').optional().isIn(['income', 'expense']).withMessage('Type must be income or expense.')],
  validate,
  dashboardController.getCategoryTotals
);

/**
 * @route   GET /api/dashboard/recent
 * @desc    Most recent transactions
 * @access  Analyst, Admin
 * @query   limit (default 10, max 50)
 */
router.get(
  '/recent',
  [query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50.')],
  validate,
  dashboardController.getRecentTransactions
);

/**
 * @route   GET /api/dashboard/trends
 * @desc    Monthly income/expense trends
 * @access  Analyst, Admin
 * @query   months (default 12, max 36)
 */
router.get(
  '/trends',
  [query('months').optional().isInt({ min: 1, max: 36 }).withMessage('Months must be between 1 and 36.')],
  validate,
  dashboardController.getMonthlyTrends
);

module.exports = router;
