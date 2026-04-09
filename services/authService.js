const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Generate a signed JWT token for a given user
 */
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

/**
 * Login: validate credentials and return a JWT
 */
const loginUser = async ({ email, password }) => {
  // Explicitly select password (it's excluded by default)
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    const err = new Error('Invalid email or password.');
    err.statusCode = 401;
    throw err;
  }

  if (user.status === 'inactive') {
    const err = new Error('Your account has been deactivated. Contact an admin.');
    err.statusCode = 403;
    throw err;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const err = new Error('Invalid email or password.');
    err.statusCode = 401;
    throw err;
  }

  const token = generateToken(user);

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    },
  };
};

module.exports = { loginUser, generateToken };
