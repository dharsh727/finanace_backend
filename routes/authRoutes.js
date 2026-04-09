const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and return JWT
 * @access  Public
 */
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('A valid email is required.').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required.'),
  ],
  validate,
  authController.login
);

/**
 * @route   GET /api/auth/me
 * @desc    Get the logged-in user's profile
 * @access  Private (all roles)
 */
router.get('/me', authenticate, authController.getMe);

module.exports = router;
