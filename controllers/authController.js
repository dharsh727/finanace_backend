const authService = require('../services/authService');

/**
 * POST /api/auth/login
 * Login with email and password → returns JWT
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const data = await authService.loginUser({ email, password });
    res.status(200).json({
      success: true,
      message: 'Login successful.',
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/me
 * Returns the currently authenticated user's profile
 */
const getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: { user: req.user },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { login, getMe };
