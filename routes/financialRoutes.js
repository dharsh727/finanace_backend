const express = require('express');
const { body, param, query } = require('express-validator');
const financialController = require('../controllers/financialController');
const { authenticate } = require('../middleware/auth');
const { adminOnly, viewerAndAbove } = require('../middleware/rbac');
const { validate } = require('../middleware/validate');

const router = express.Router();

// All financial record routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/records
 * @desc    Create a new financial record
 * @access  Admin
 */
router.post(
  '/',
  adminOnly,
  [
    body('amount')
      .isFloat({ min: 0.01 })
      .withMessage('Amount must be a positive number.'),
    body('type')
      .isIn(['income', 'expense'])
      .withMessage('Type must be income or expense.'),
    body('category')
      .trim()
      .notEmpty()
      .withMessage('Category is required.')
      .isLength({ max: 100 }),
    body('date')
      .optional()
      .isISO8601()
      .withMessage('Date must be a valid ISO 8601 date.'),
    body('notes')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Notes cannot exceed 500 characters.'),
  ],
  validate,
  financialController.createRecord
);

/**
 * @route   GET /api/records
 * @desc    List financial records with filters
 * @access  Viewer, Analyst, Admin
 * @query   type, category, startDate, endDate, page, limit
 */
router.get(
  '/',
  viewerAndAbove,
  [
    query('type').optional().isIn(['income', 'expense']).withMessage('Type must be income or expense.'),
    query('startDate').optional().isISO8601().withMessage('startDate must be a valid ISO 8601 date.'),
    query('endDate').optional().isISO8601().withMessage('endDate must be a valid ISO 8601 date.'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer.'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100.'),
  ],
  validate,
  financialController.getRecords
);

/**
 * @route   GET /api/records/:id
 * @desc    Get a single record by ID
 * @access  Viewer, Analyst, Admin
 */
router.get(
  '/:id',
  viewerAndAbove,
  [param('id').isMongoId().withMessage('Invalid record ID.')],
  validate,
  financialController.getRecordById
);

/**
 * @route   PUT /api/records/:id
 * @desc    Update a financial record
 * @access  Admin
 */
router.put(
  '/:id',
  adminOnly,
  [
    param('id').isMongoId().withMessage('Invalid record ID.'),
    body('amount').optional().isFloat({ min: 0.01 }).withMessage('Amount must be a positive number.'),
    body('type').optional().isIn(['income', 'expense']).withMessage('Type must be income or expense.'),
    body('category').optional().trim().isLength({ max: 100 }),
    body('date').optional().isISO8601().withMessage('Date must be a valid ISO 8601 date.'),
    body('notes').optional().trim().isLength({ max: 500 }),
  ],
  validate,
  financialController.updateRecord
);

/**
 * @route   DELETE /api/records/:id
 * @desc    Delete a financial record
 * @access  Admin
 */
router.delete(
  '/:id',
  adminOnly,
  [param('id').isMongoId().withMessage('Invalid record ID.')],
  validate,
  financialController.deleteRecord
);

module.exports = router;
