const FinancialRecord = require('../models/FinancialRecord');

/**
 * Get summary: total income, total expenses, and net balance
 */
const getSummary = async () => {
  const result = await FinancialRecord.aggregate([
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' },
      },
    },
  ]);

  let totalIncome = 0;
  let totalExpenses = 0;

  result.forEach((item) => {
    if (item._id === 'income') totalIncome = item.total;
    if (item._id === 'expense') totalExpenses = item.total;
  });

  return {
    totalIncome: parseFloat(totalIncome.toFixed(2)),
    totalExpenses: parseFloat(totalExpenses.toFixed(2)),
    netBalance: parseFloat((totalIncome - totalExpenses).toFixed(2)),
  };
};

/**
 * Get totals grouped by category
 */
const getCategoryTotals = async (type) => {
  const matchStage = type ? { $match: { type } } : { $match: {} };

  const result = await FinancialRecord.aggregate([
    matchStage,
    {
      $group: {
        _id: { category: '$category', type: '$type' },
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        category: '$_id.category',
        type: '$_id.type',
        total: { $round: ['$total', 2] },
        count: 1,
      },
    },
    { $sort: { total: -1 } },
  ]);

  return result;
};

/**
 * Get recent N transactions (default 10)
 */
const getRecentTransactions = async (limit = 10) => {
  return FinancialRecord.find()
    .sort({ date: -1, createdAt: -1 })
    .limit(Number(limit))
    .populate('createdBy', 'name email');
};

/**
 * Get monthly income/expense trends
 * Returns data grouped by year-month for a given number of past months
 */
const getMonthlyTrends = async (months = 12) => {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months + 1);
  startDate.setDate(1);
  startDate.setHours(0, 0, 0, 0);

  const result = await FinancialRecord.aggregate([
    { $match: { date: { $gte: startDate } } },
    {
      $group: {
        _id: {
          year: { $year: '$date' },
          month: { $month: '$date' },
          type: '$type',
        },
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        year: '$_id.year',
        month: '$_id.month',
        type: '$_id.type',
        total: { $round: ['$total', 2] },
        count: 1,
      },
    },
    {
      $sort: { year: 1, month: 1 },
    },
  ]);

  // Reshape into a flat period-first format
  const periodMap = {};
  result.forEach(({ year, month, type, total, count }) => {
    const key = `${year}-${String(month).padStart(2, '0')}`;
    if (!periodMap[key]) {
      periodMap[key] = { period: key, year, month, income: 0, expense: 0, incomeCount: 0, expenseCount: 0 };
    }
    if (type === 'income') {
      periodMap[key].income = total;
      periodMap[key].incomeCount = count;
    } else {
      periodMap[key].expense = total;
      periodMap[key].expenseCount = count;
    }
  });

  return Object.values(periodMap).sort((a, b) => a.period.localeCompare(b.period));
};

module.exports = { getSummary, getCategoryTotals, getRecentTransactions, getMonthlyTrends };
