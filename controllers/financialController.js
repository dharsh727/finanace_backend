const financialService = require('../services/financialService');

/**
 * POST /api/records
 * Create a financial record (admin only)
 */
const createRecord = async (req, res, next) => {
  try {
    const record = await financialService.createRecord(req.body, req.user._id);
    res.status(201).json({ success: true, message: 'Record created successfully.', data: { record } });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/records
 * Get all records with filters (viewer, analyst, admin)
 * Query: type, category, startDate, endDate, page, limit
 */
const getRecords = async (req, res, next) => {
  try {
    const { type, category, startDate, endDate, page, limit } = req.query;
    const data = await financialService.getRecords({ type, category, startDate, endDate, page, limit });
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/records/:id
 * Get a single financial record by ID
 */
const getRecordById = async (req, res, next) => {
  try {
    const record = await financialService.getRecordById(req.params.id);
    res.status(200).json({ success: true, data: { record } });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/records/:id
 * Update a financial record (admin only)
 */
const updateRecord = async (req, res, next) => {
  try {
    const record = await financialService.updateRecord(req.params.id, req.body);
    res.status(200).json({ success: true, message: 'Record updated successfully.', data: { record } });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/records/:id
 * Delete a financial record (admin only)
 */
const deleteRecord = async (req, res, next) => {
  try {
    await financialService.deleteRecord(req.params.id);
    res.status(200).json({ success: true, message: 'Record deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createRecord, getRecords, getRecordById, updateRecord, deleteRecord };
