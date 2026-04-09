# 💰 Finance Dashboard Backend

A complete, production-ready backend for a Finance Dashboard application with **Role-Based Access Control (RBAC)**, built with **Node.js**, **Express.js**, **MongoDB (Mongoose)**, and **JWT Authentication**.

---

## 📁 Project Structure

```
finance_backend/
├── config/
│   ├── db.js                  # MongoDB connection
│   └── seed.js                # Database seeder (test data)
├── controllers/
│   ├── authController.js      # Login, /me
│   ├── dashboardController.js # Summary, categories, trends, recent
│   ├── financialController.js # CRUD for financial records
│   └── userController.js      # CRUD for users + role assignment
├── middleware/
│   ├── auth.js                # JWT authentication middleware
│   ├── errorHandler.js        # Global error handler + 404
│   ├── rbac.js                # Role-Based Access Control
│   └── validate.js            # express-validator result handler
├── models/
│   ├── FinancialRecord.js     # Financial record schema
│   └── User.js                # User schema (with bcrypt)
├── routes/
│   ├── authRoutes.js          # /api/auth
│   ├── dashboardRoutes.js     # /api/dashboard
│   ├── financialRoutes.js     # /api/records
│   └── userRoutes.js          # /api/users
├── services/
│   ├── authService.js         # Login business logic, JWT generation
│   ├── dashboardService.js    # Aggregation queries
│   ├── financialService.js    # Financial record CRUD logic
│   └── userService.js         # User CRUD logic
├── .env                       # Environment variables
├── .gitignore
├── package.json
└── server.js                  # App entry point
```

---

## ⚙️ Prerequisites

- **Node.js** v18+
- **MongoDB** (local or Atlas)
- **npm** v9+

---

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Edit the `.env` file:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/finance_dashboard
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=12
```

> **⚠️ Important:** Set a strong, random `JWT_SECRET` in production.

### 3. Seed the Database (Optional)

Populate the database with test users and 30 financial records:

```bash
npm run seed
```

**Test credentials after seeding:**

| Role    | Email                  | Password    |
|---------|------------------------|-------------|
| Admin   | admin@finance.com      | Admin@123   |
| Analyst | analyst@finance.com    | Analyst@123 |
| Viewer  | viewer@finance.com     | Viewer@123  |

### 4. Start the Server

```bash
# Development (with hot-reload)
npm run dev

# Production
npm start
```

Server starts at: **http://localhost:5000**

---

## 🔐 Role-Based Access Control

| Feature                      | Viewer | Analyst | Admin |
|------------------------------|:------:|:-------:|:-----:|
| Login / View Profile         | ✅     | ✅      | ✅    |
| Read Financial Records       | ✅     | ✅      | ✅    |
| Create/Update/Delete Records | ❌     | ❌      | ✅    |
| View Dashboard (all APIs)    | ❌     | ✅      | ✅    |
| Manage Users                 | ❌     | ❌      | ✅    |
| Assign Roles                 | ❌     | ❌      | ✅    |

---

## 📡 API Endpoints

All authenticated routes require the header:
```
Authorization: Bearer <your_jwt_token>
```

---

### 🔑 Auth — `/api/auth`

#### `POST /api/auth/login`
Login and receive a JWT token.

**Request:**
```json
{
  "email": "admin@finance.com",
  "password": "Admin@123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "663abc...",
      "name": "Super Admin",
      "email": "admin@finance.com",
      "role": "admin",
      "status": "active"
    }
  }
}
```

---

#### `GET /api/auth/me`
Get the currently authenticated user's profile.

---

### 👥 Users — `/api/users` *(Admin Only)*

| Method | Endpoint              | Description              |
|--------|-----------------------|--------------------------|
| POST   | `/api/users`          | Create a new user        |
| GET    | `/api/users`          | List all users           |
| GET    | `/api/users/:id`      | Get user by ID           |
| PUT    | `/api/users/:id`      | Update user              |
| DELETE | `/api/users/:id`      | Delete user              |
| PATCH  | `/api/users/:id/role` | Assign role to user      |

**GET /api/users query params:**
- `role` — filter by `viewer`, `analyst`, or `admin`
- `status` — filter by `active` or `inactive`
- `page`, `limit` — pagination

**POST /api/users body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@finance.com",
  "password": "SecurePass@1",
  "role": "analyst",
  "status": "active"
}
```

**PATCH /api/users/:id/role body:**
```json
{ "role": "analyst" }
```

---

### 💰 Financial Records — `/api/records`

| Method | Endpoint           | Role Required | Description           |
|--------|--------------------|---------------|-----------------------|
| POST   | `/api/records`     | Admin         | Create a record       |
| GET    | `/api/records`     | All           | List records          |
| GET    | `/api/records/:id` | All           | Get record by ID      |
| PUT    | `/api/records/:id` | Admin         | Update record         |
| DELETE | `/api/records/:id` | Admin         | Delete record         |

**POST /api/records body:**
```json
{
  "amount": 5000.00,
  "type": "income",
  "category": "Salary",
  "date": "2025-04-01",
  "notes": "April salary"
}
```

**GET /api/records query params:**
- `type` — `income` | `expense`
- `category` — partial match (case-insensitive)
- `startDate` — ISO 8601 date (e.g. `2025-01-01`)
- `endDate` — ISO 8601 date
- `page`, `limit` — pagination

---

### 📊 Dashboard — `/api/dashboard` *(Analyst + Admin)*

| Endpoint                         | Description                           |
|----------------------------------|---------------------------------------|
| `GET /api/dashboard/summary`     | Total income, expenses, net balance   |
| `GET /api/dashboard/categories`  | Totals grouped by category            |
| `GET /api/dashboard/recent`      | Recent transactions (default 10)      |
| `GET /api/dashboard/trends`      | Monthly income/expense trends         |

**GET /api/dashboard/summary response:**
```json
{
  "success": true,
  "data": {
    "totalIncome": 85000.00,
    "totalExpenses": 32000.00,
    "netBalance": 53000.00
  }
}
```

**GET /api/dashboard/trends?months=6 response:**
```json
{
  "success": true,
  "data": [
    { "period": "2025-01", "year": 2025, "month": 1, "income": 10000, "expense": 4000, "incomeCount": 3, "expenseCount": 2 },
    { "period": "2025-02", "year": 2025, "month": 2, "income": 12000, "expense": 5000, "incomeCount": 4, "expenseCount": 3 }
  ]
}
```

---

## 🛡️ Error Responses

All errors return a consistent shape:

```json
{
  "success": false,
  "message": "Descriptive error message.",
  "errors": [
    { "field": "email", "message": "A valid email is required." }
  ]
}
```

| Status | Meaning                   |
|--------|---------------------------|
| 200    | OK                        |
| 201    | Created                   |
| 400    | Bad Request               |
| 401    | Unauthorized (no/bad JWT) |
| 403    | Forbidden (wrong role)    |
| 404    | Not Found                 |
| 409    | Conflict (duplicate)      |
| 422    | Validation Error          |
| 500    | Internal Server Error     |

---

## 🏥 Health Check

```
GET /health
```
```json
{
  "success": true,
  "message": "Finance Dashboard API is running.",
  "environment": "development",
  "timestamp": "2025-04-08T08:00:00.000Z"
}
```
