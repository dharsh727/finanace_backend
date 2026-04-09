const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('./db');

const User = require('../models/User');
const FinancialRecord = require('../models/FinancialRecord');

const seed = async () => {
  await connectDB();

  // Wipe existing data
  await User.deleteMany();
  await FinancialRecord.deleteMany();

  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;

  // Create users
  const users = await User.insertMany([
    {
      name: 'Super Admin',
      email: 'admin@finance.com',
      password: await bcrypt.hash('Admin@123', saltRounds),
      role: 'admin',
      status: 'active',
    },
    {
      name: 'Alice Analyst',
      email: 'analyst@finance.com',
      password: await bcrypt.hash('Analyst@123', saltRounds),
      role: 'analyst',
      status: 'active',
    },
    {
      name: 'Victor Viewer',
      email: 'viewer@finance.com',
      password: await bcrypt.hash('Viewer@123', saltRounds),
      role: 'viewer',
      status: 'active',
    },
  ]);

  console.log('✅ Users seeded');

  // Seed financial records
  const categories = ['Salary', 'Rent', 'Utilities', 'Marketing', 'Sales', 'Investment', 'Maintenance', 'Travel'];
  const records = [];

  for (let i = 0; i < 30; i++) {
    const type = i % 3 === 0 ? 'expense' : 'income';
    const month = (i % 6) + 1;
    records.push({
      amount: parseFloat((Math.random() * 9000 + 1000).toFixed(2)),
      type,
      category: categories[i % categories.length],
      date: new Date(`2025-${String(month).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`),
      notes: `Sample ${type} record #${i + 1}`,
      createdBy: users[0]._id,
    });
  }

  await FinancialRecord.insertMany(records);
  console.log('✅ Financial records seeded');

  console.log('\n🎉 Seed complete!\n');
  console.log('Test Credentials:');
  console.log('  Admin    → admin@finance.com    / Admin@123');
  console.log('  Analyst  → analyst@finance.com  / Analyst@123');
  console.log('  Viewer   → viewer@finance.com   / Viewer@123');

  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
