const http = require('http');

const BASE = 'http://localhost:5000';
const results = [];

function request(method, path, body, token) {
  return new Promise((resolve) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
      },
    };
    const req = http.request(options, (res) => {
      let raw = '';
      res.on('data', (chunk) => (raw += chunk));
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(raw) }); }
        catch { resolve({ status: res.statusCode, body: raw }); }
      });
    });
    req.on('error', (e) => resolve({ status: 0, body: { message: e.message } }));
    if (data) req.write(data);
    req.end();
  });
}

function pass(label, detail) {
  results.push({ ok: true, label, detail });
}
function fail(label, detail) {
  results.push({ ok: false, label, detail });
}

function check(label, res, expectStatus, expectBlocked = false) {
  if (expectBlocked) {
    if (res.status === expectStatus) pass(label, res.body.message || 'Blocked correctly');
    else fail(label, `Expected ${expectStatus}, got ${res.status}: ${res.body.message}`);
  } else {
    if (res.status === expectStatus) pass(label, res.body.message || 'OK');
    else fail(label, `Expected ${expectStatus}, got ${res.status}: ${res.body?.message}`);
  }
}

async function run() {
  let at, ant, vt, newUserId, rid;

  // ── Health ───────────────────────────────────────────────
  let r = await request('GET', '/health');
  check('GET /health', r, 200);

  // ── Auth: Login ──────────────────────────────────────────
  r = await request('POST', '/api/auth/login', { email: 'admin@finance.com', password: 'Admin@123' });
  if (r.status === 200) { at = r.body.data.token; pass('POST /api/auth/login (admin)', 'Token OK'); }
  else fail('POST /api/auth/login (admin)', r.body.message);

  r = await request('POST', '/api/auth/login', { email: 'analyst@finance.com', password: 'Analyst@123' });
  if (r.status === 200) { ant = r.body.data.token; pass('POST /api/auth/login (analyst)', 'Token OK'); }
  else fail('POST /api/auth/login (analyst)', r.body.message);

  r = await request('POST', '/api/auth/login', { email: 'viewer@finance.com', password: 'Viewer@123' });
  if (r.status === 200) { vt = r.body.data.token; pass('POST /api/auth/login (viewer)', 'Token OK'); }
  else fail('POST /api/auth/login (viewer)', r.body.message);

  r = await request('POST', '/api/auth/login', { email: 'admin@finance.com', password: 'wrongpass' });
  check('POST /api/auth/login wrong password (401)', r, 401, true);

  r = await request('GET', '/api/auth/me', null, at);
  if (r.status === 200) pass('GET /api/auth/me (admin)', `User: ${r.body.data.name} [${r.body.data.role}]`);
  else fail('GET /api/auth/me', r.body.message);

  // ── Users ────────────────────────────────────────────────
  r = await request('GET', '/api/users', null, at);
  if (r.status === 200) pass('GET /api/users (admin)', `Count: ${r.body.data.length}`);
  else fail('GET /api/users (admin)', r.body.message);

  r = await request('GET', '/api/users', null, vt);
  check('GET /api/users (viewer → 403)', r, 403, true);

  r = await request('POST', '/api/users', { name: 'Test User', email: 'testuser99@finance.com', password: 'Test@1234', role: 'viewer' }, at);
  if (r.status === 201) { newUserId = r.body.data._id; pass('POST /api/users (admin create)', `ID: ${newUserId}`); }
  else fail('POST /api/users (create)', r.body.message);

  if (newUserId) {
    r = await request('GET', `/api/users/${newUserId}`, null, at);
    if (r.status === 200) pass('GET /api/users/:id', `Email: ${r.body.data.email}`);
    else fail('GET /api/users/:id', r.body.message);

    r = await request('PUT', `/api/users/${newUserId}`, { name: 'Updated User' }, at);
    check('PUT /api/users/:id (admin)', r, 200);

    r = await request('PATCH', `/api/users/${newUserId}/role`, { role: 'analyst' }, at);
    check('PATCH /api/users/:id/role', r, 200);

    r = await request('DELETE', `/api/users/${newUserId}`, null, at);
    check('DELETE /api/users/:id (admin)', r, 200);
  }

  // ── Financial Records ────────────────────────────────────
  r = await request('GET', '/api/records', null, vt);
  if (r.status === 200) pass('GET /api/records (viewer)', `Total: ${r.body.data.pagination.total}, Page: ${r.body.data.records.length}`);
  else fail('GET /api/records (viewer)', r.body.message);

  r = await request('GET', '/api/records?type=income&limit=5', null, vt);
  if (r.status === 200) pass('GET /api/records?type=income', `Returned: ${r.body.data.records.length}`);
  else fail('GET /api/records?type=income', r.body.message);

  r = await request('GET', '/api/records?type=expense&limit=5', null, vt);
  if (r.status === 200) pass('GET /api/records?type=expense', `Returned: ${r.body.data.records.length}`);
  else fail('GET /api/records?type=expense', r.body.message);

  r = await request('GET', '/api/records?category=Salary', null, vt);
  if (r.status === 200) pass('GET /api/records?category=Salary', `Returned: ${r.body.data.records.length}`);
  else fail('GET /api/records?category=Salary', r.body.message);

  r = await request('GET', '/api/records?startDate=2025-01-01&endDate=2025-06-30', null, at);
  if (r.status === 200) pass('GET /api/records?startDate+endDate filter', `Returned: ${r.body.data.records.length}`);
  else fail('GET /api/records date filter', r.body.message);

  r = await request('GET', '/api/records?page=2&limit=5', null, at);
  check('GET /api/records?page=2&limit=5 (pagination)', r, 200);

  r = await request('POST', '/api/records', { amount: 9999, type: 'income', category: 'Consulting', date: '2025-08-01', notes: 'Test record' }, at);
  if (r.status === 201) { rid = r.body.data._id; pass('POST /api/records (admin create)', `ID: ${rid}, Amount: ${r.body.data.amount}`); }
  else fail('POST /api/records (create)', r.body.message);

  r = await request('POST', '/api/records', { amount: 100, type: 'income', category: 'Test' }, vt);
  check('POST /api/records (viewer → 403)', r, 403, true);

  r = await request('POST', '/api/records', { amount: -5, type: 'bad' }, at);
  check('POST /api/records bad payload (422)', r, 422, true);

  if (rid) {
    r = await request('GET', `/api/records/${rid}`, null, vt);
    if (r.status === 200) pass('GET /api/records/:id (viewer)', `Amount: ${r.body.data.amount}`);
    else fail('GET /api/records/:id', r.body.message);

    r = await request('PUT', `/api/records/${rid}`, { amount: 15000, notes: 'Updated' }, at);
    if (r.status === 200) pass('PUT /api/records/:id (admin)', `New amount: ${r.body.data.amount}`);
    else fail('PUT /api/records/:id', r.body.message);

    r = await request('PUT', `/api/records/${rid}`, { amount: 1 }, vt);
    check('PUT /api/records/:id (viewer → 403)', r, 403, true);

    r = await request('DELETE', `/api/records/${rid}`, null, at);
    check('DELETE /api/records/:id (admin)', r, 200);
  }

  // ── Dashboard ────────────────────────────────────────────
  r = await request('GET', '/api/dashboard/summary', null, ant);
  if (r.status === 200) pass('GET /api/dashboard/summary (analyst)', `Income: ${r.body.data.totalIncome} | Expense: ${r.body.data.totalExpenses} | Net: ${r.body.data.netBalance}`);
  else fail('GET /api/dashboard/summary', r.body.message);

  r = await request('GET', '/api/dashboard/categories', null, ant);
  if (r.status === 200) pass('GET /api/dashboard/categories (analyst)', `Groups: ${r.body.data.length}`);
  else fail('GET /api/dashboard/categories', r.body.message);

  r = await request('GET', '/api/dashboard/categories?type=income', null, ant);
  check('GET /api/dashboard/categories?type=income', r, 200);

  r = await request('GET', '/api/dashboard/recent?limit=5', null, ant);
  if (r.status === 200) pass('GET /api/dashboard/recent?limit=5', `Returned: ${r.body.data.length} transactions`);
  else fail('GET /api/dashboard/recent', r.body.message);

  r = await request('GET', '/api/dashboard/trends?months=6', null, ant);
  if (r.status === 200) pass('GET /api/dashboard/trends?months=6', `Periods: ${r.body.data.length}`);
  else fail('GET /api/dashboard/trends', r.body.message);

  r = await request('GET', '/api/dashboard/summary', null, vt);
  check('GET /api/dashboard/summary (viewer → 403)', r, 403, true);

  // ── Security ─────────────────────────────────────────────
  r = await request('GET', '/api/records', null, 'bad.token.xyz');
  check('Bad token (401)', r, 401, true);

  r = await request('GET', '/api/records');
  check('No token (401)', r, 401, true);

  // ── Print Results ─────────────────────────────────────────
  const GREEN = '\x1b[32m', RED = '\x1b[31m', CYAN = '\x1b[36m', YELLOW = '\x1b[33m', RESET = '\x1b[0m';
  console.log(`\n${CYAN}${'='.repeat(72)}${RESET}`);
  console.log(`${CYAN}                   FULL API TEST RESULTS${RESET}`);
  console.log(`${CYAN}${'='.repeat(72)}${RESET}`);
  results.forEach(({ ok, label, detail }) => {
    const icon = ok ? `${GREEN}[PASS]${RESET}` : `${RED}[FAIL]${RESET}`;
    console.log(`${icon}  ${label.padEnd(52)} ${detail}`);
  });
  const passed = results.filter((r) => r.ok).length;
  const failed = results.filter((r) => !r.ok).length;
  console.log(`\n${YELLOW}  PASSED: ${passed}   FAILED: ${failed}   TOTAL: ${results.length}${RESET}`);
  console.log(`${CYAN}${'='.repeat(72)}${RESET}\n`);
}

run().catch(console.error);
