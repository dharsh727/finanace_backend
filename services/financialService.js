const FinancialRecord = require('../models/FinancialRecord');

/**
 * Build a filter object from query parameters
 */
const buildFilter = ({ type, category, startDate, endDate }) => {
  const filter = {};
  if (type) filter.type = type;
  if (category) filter.category = { $regex: category, $options: 'i' };
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }
  return filter;
};

/**
 * Create a financial record
 */
const createRecord = async (data, userId) => {
  const record = await FinancialRecord.create({ ...data, createdBy: userId });
  return record.populate('createdBy', 'name email');
};

/**
 * Get all records with filtering and pagination
 */
const getRecords = async ({ type, category, startDate, endDate, page = 1, limit = 20 }) => {
  const filter = buildFilter({ type, category, startDate, endDate });
  const skip = (page - 1) * limit;

  const [records, total] = await Promise.all([
    FinancialRecord.find(filter)
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('createdBy', 'name email'),
    FinancialRecord.countDocuments(filter),
  ]);

  return {
    records,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get a single record by ID
 */
const getRecordById = async (id) => {
  const record = await FinancialRecord.findById(id).populate('createdBy', 'name email');
  if (!record) {
    const err = new Error('Financial record not found.');
    err.statusCode = 404;
    throw err;
  }
  return record;
};

/**
 * Update a financial record
 */
const updateRecord = async (id, updates) => {
  const record = await FinancialRecord.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  }).populate('createdBy', 'name email');

  if (!record) {
    const err = new Error('Financial record not found.');
    err.statusCode = 404;
    throw err;
  }
  return record;
};

/**
 * Delete a financial record
 */
const deleteRecord = async (id) => {
  const record = await FinancialRecord.findByIdAndDelete(id);
  if (!record) {
    const err = new Error('Financial record not found.');
    err.statusCode = 404;
    throw err;
  }
  return record;
};

module.exports = { createRecord, getRecords, getRecordById, updateRecord, deleteRecord };
