const express = require('express');
const { body, param } = require('express-validator');
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');
const { adminOnly } = require('../middleware/rbac');
const { validate } = require('../middleware/validate');

const router = express.Router();

// All user routes require authentication + admin role
router.use(authenticate, adminOnly);

/**
 * @route   POST /api/users
 * @desc    Create a new user
 * @access  Admin
 */
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required.').isLength({ min: 2, max: 100 }),
    body('email').isEmail().withMessage('A valid email is required.').normalizeEmail(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters.'),
    body('role')
      .optional()
      .isIn(['viewer', 'analyst', 'admin'])
      .withMessage('Role must be viewer, analyst, or admin.'),
    body('status')
      .optional()
      .isIn(['active', 'inactive'])
      .withMessage('Status must be active or inactive.'),
  ],
  validate,
  userController.createUser
);

/**
 * @route   GET /api/users
 * @desc    List all users (with optional role/status filters)
 * @access  Admin
 */
router.get('/', userController.getAllUsers);

/**
 * @route   GET /api/users/:id
 * @desc    Get a single user by ID
 * @access  Admin
 */
router.get(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid user ID.')],
  validate,
  userController.getUserById
);

/**
 * @route   PUT /api/users/:id
 * @desc    Update a user's name, role, or status
 * @access  Admin
 */
router.put(
  '/:id',
  [
    param('id').isMongoId().withMessage('Invalid user ID.'),
    body('name').optional().trim().isLength({ min: 2, max: 100 }),
    body('role')
      .optional()
      .isIn(['viewer', 'analyst', 'admin'])
      .withMessage('Role must be viewer, analyst, or admin.'),
    body('status')
      .optional()
      .isIn(['active', 'inactive'])
      .withMessage('Status must be active or inactive.'),
  ],
  validate,
  userController.updateUser
);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete a user
 * @access  Admin
 */
router.delete(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid user ID.')],
  validate,
  userController.deleteUser
);

/**
 * @route   PATCH /api/users/:id/role
 * @desc    Assign a role to a user
 * @access  Admin
 */
router.patch(
  '/:id/role',
  [
    param('id').isMongoId().withMessage('Invalid user ID.'),
    body('role')
      .isIn(['viewer', 'analyst', 'admin'])
      .withMessage('Role must be viewer, analyst, or admin.'),
  ],
  validate,
  userController.assignRole
);

module.exports = router;
