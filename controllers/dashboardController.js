const dashboardService = require('../services/dashboardService');

/**
 * GET /api/dashboard/summary
 * Returns total income, total expenses, and net balance
 */
const getSummary = async (req, res, next) => {
  try {
    const data = await dashboardService.getSummary();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/dashboard/categories
 * Returns category-wise totals
 * Query: type (income|expense) — optional filter
 */
const getCategoryTotals = async (req, res, next) => {
  try {
    const { type } = req.query;
    const data = await dashboardService.getCategoryTotals(type);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/dashboard/recent
 * Returns the most recent transactions
 * Query: limit (default 10)
 */
const getRecentTransactions = async (req, res, next) => {
  try {
    const { limit } = req.query;
    const data = await dashboardService.getRecentTransactions(limit);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/dashboard/trends
 * Returns monthly income/expense trends
 * Query: months (default 12)
 */
const getMonthlyTrends = async (req, res, next) => {
  try {
    const { months } = req.query;
    const data = await dashboardService.getMonthlyTrends(months);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

module.exports = { getSummary, getCategoryTotals, getRecentTransactions, getMonthlyTrends };
