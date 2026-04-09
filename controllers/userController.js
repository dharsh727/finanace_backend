const userService = require('../services/userService');

/**
 * POST /api/users
 * Create a new user (admin only)
 */
const createUser = async (req, res, next) => {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).json({ success: true, message: 'User created successfully.', data: { user } });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/users
 * List all users with optional filters (admin only)
 */
const getAllUsers = async (req, res, next) => {
  try {
    const { role, status, page, limit } = req.query;
    const data = await userService.getAllUsers({ role, status, page, limit });
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/users/:id
 * Get a single user by ID (admin only)
 */
const getUserById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    res.status(200).json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/users/:id
 * Update user name, role, or status (admin only)
 */
const updateUser = async (req, res, next) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body);
    res.status(200).json({ success: true, message: 'User updated successfully.', data: { user } });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/users/:id
 * Delete a user (admin only)
 */
const deleteUser = async (req, res, next) => {
  try {
    await userService.deleteUser(req.params.id);
    res.status(200).json({ success: true, message: 'User deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/users/:id/role
 * Assign a role to a user (admin only)
 */
const assignRole = async (req, res, next) => {
  try {
    const user = await userService.assignRole(req.params.id, req.body.role);
    res.status(200).json({ success: true, message: 'Role assigned successfully.', data: { user } });
  } catch (error) {
    next(error);
  }
};

module.exports = { createUser, getAllUsers, getUserById, updateUser, deleteUser, assignRole };
