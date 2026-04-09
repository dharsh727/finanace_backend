const User = require('../models/User');

/**
 * Create a new user (admin only)
 */
const createUser = async ({ name, email, password, role, status }) => {
  const existing = await User.findOne({ email });
  if (existing) {
    const err = new Error('A user with this email already exists.');
    err.statusCode = 409;
    throw err;
  }

  const user = await User.create({ name, email, password, role, status });
  return user;
};

/**
 * Get all users with optional filters
 */
const getAllUsers = async ({ role, status, page = 1, limit = 20 }) => {
  const filter = {};
  if (role) filter.role = role;
  if (status) filter.status = status;

  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  return {
    users,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get a single user by ID
 */
const getUserById = async (id) => {
  const user = await User.findById(id);
  if (!user) {
    const err = new Error('User not found.');
    err.statusCode = 404;
    throw err;
  }
  return user;
};

/**
 * Update a user (role / status / name)
 */
const updateUser = async (id, updates) => {
  const allowedFields = ['name', 'role', 'status'];
  const filteredUpdates = {};
  allowedFields.forEach((field) => {
    if (updates[field] !== undefined) filteredUpdates[field] = updates[field];
  });

  const user = await User.findByIdAndUpdate(id, filteredUpdates, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    const err = new Error('User not found.');
    err.statusCode = 404;
    throw err;
  }
  return user;
};

/**
 * Delete a user (admin only)
 */
const deleteUser = async (id) => {
  const user = await User.findByIdAndDelete(id);
  if (!user) {
    const err = new Error('User not found.');
    err.statusCode = 404;
    throw err;
  }
  return user;
};

/**
 * Assign a role to a user
 */
const assignRole = async (id, role) => {
  const user = await User.findByIdAndUpdate(
    id,
    { role },
    { new: true, runValidators: true }
  );
  if (!user) {
    const err = new Error('User not found.');
    err.statusCode = 404;
    throw err;
  }
  return user;
};

module.exports = { createUser, getAllUsers, getUserById, updateUser, deleteUser, assignRole };
