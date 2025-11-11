# 🏦 Philand — Personal & Team Finance Management API (Rust + MySQL)

Philand is a **secure, role-based financial management backend** built with **Rust**, **Axum**, and **MySQL**.  
It enables individuals and teams to **track budgets, categorize income/expenses, manage members with roles**, and ensure security through **JWT auth, bcrypt passwords, rate limiting**, and **password reset flows**.

---

## 🚀 Features

- **Modern Rust backend** using Axum + SQLx
- **JWT-based authentication** with bcrypt password hashing
- **Role-based access control** (Owner, Manager, Contributor, Viewer)
- **Budget management** with nested categories and entries
- **Monthly summaries & analytics endpoints**
- **Password reset flows** (email token + OTP)
- **Rate limiting & IP throttling** for `/auth/*` routes
- **Docker Compose** for easy local MySQL setup
- **SQLx migrations** included

---

## 🧩 Project Structure

```
philand-backend/
├── src/
│   ├── web/           # HTTP route handlers
│   ├── service/       # Business logic
│   ├── repo/          # Database queries (SQLx)
│   ├── models/        # Structs, DTOs, enums
│   ├── db.rs          # DB connection pool
│   ├── limiter.rs     # Rate limiting middleware
│   ├── error.rs       # Unified error handler
│   └── main.rs        # Axum bootstrap
├── migrations/        # MySQL migrations
├── .env.example       # Environment config sample
├── Cargo.toml         # Rust dependencies
├── docker-compose.yml # Local MySQL setup
└── README.md
```

---

## ⚙️ Environment Variables

```bash
DATABASE_URL="mysql://philand:philand@127.0.0.1:3306/philand"
PORT=8080
CORS_ORIGINS="http://localhost:3000"

# Auth & JWT
JWT_SECRET="super-secret"
JWT_TTL_MIN=10080
BCRYPT_COST=12

# Password Reset TTLs (minutes)
RESET_TOKEN_TTL_MIN=15
RESET_OTP_TTL_MIN=10

# Rate Limit Config
AUTH_RATE_LIMIT_SHORT_WINDOW_SEC=10
AUTH_RATE_LIMIT_SHORT_MAX=8
AUTH_RATE_LIMIT_LONG_WINDOW_SEC=600
AUTH_RATE_LIMIT_LONG_MAX=80
AUTH_FAIL_LOCK_MIN=15
AUTH_FAIL_LOCK_THRESHOLD=10
```

---

## 📡 API Overview

| **Group** | **Method** | **Path** | **Purpose / Why this API exists** |
|------------|-------------|-----------|----------------------------------|
| **Auth & Security** | POST | `/auth/signup` | Register a new account with bcrypt-hashed password for secure authentication. |
|  | POST | `/auth/login` | Authenticate user credentials and issue JWT for protected access. |
|  | POST | `/auth/forgot/email` | Initiate password reset flow via **email token** for users who forgot their password. |
|  | POST | `/auth/forgot/otp` | Start password reset flow using a **one-time code (OTP)** for alternate recovery. |
|  | POST | `/auth/reset` | Complete password reset (accepts token **or** OTP) and update stored bcrypt hash. |
|  | *(Middleware)* | `/auth/*` | Apply **rate limiting and IP throttling** to mitigate brute force or abuse. |
| **Users** | GET | `/api/users` | Retrieve user list for management, admin view, or collaborator search. |
| **Budgets** | GET | `/api/budgets` | Fetch all budgets, optionally filtered by `owner_id`, for dashboard display. |
|  | GET | `/api/budgets/:id` | Retrieve detailed info about one budget (currency, owner, etc.). |
|  | POST | `/api/budgets` | Create new budget; authenticated user automatically becomes **Owner**. |
| **Categories** | GET | `/api/budgets/:id/categories` | List all categories (income/expense) to populate filters or reports. |
|  | POST | `/api/budgets/:id/categories` | Add new category — allowed for **Manager+** roles to manage taxonomy. |
| **Entries** | GET | `/api/budgets/:id/entries` | List budget transactions with filters (date range, kind). Useful for tables/statements. |
|  | POST | `/api/budgets/:id/entries` | Add income or expense entry. **Contributor+** required. |
| **Summaries** | GET | `/api/budgets/:id/summary/monthly` | Return pre-aggregated monthly totals (income, expense, net) for charts and analytics. |
| **Members & Roles** | GET | `/api/budgets/:id/members` | List all members and roles — **Owner-only** for access control overview. |
|  | POST | `/api/budgets/:id/members` | Add or update a member and role — **Owner-only** for team management. |
|  | PATCH | `/api/budgets/:id/members/:user_id` | Modify role of a specific member — **Owner-only**. |
|  | DELETE | `/api/budgets/:id/members/:user_id` | Remove a member from the budget — **Owner-only**, for revoking access. |
| **Health** | GET | `/healthz` | Simple liveness check for Docker/Kubernetes and uptime monitors. |

---

## 🧠 Role Hierarchy

| Role | Level | Description |
|------|--------|-------------|
| **Owner** | 0 | Full control; can manage members, budgets, and settings. |
| **Manager** | 1 | Manage categories and entries; view all data. |
| **Contributor** | 2 | Add new entries but cannot manage others. |
| **Viewer** | 3 | Read-only access to budgets and summaries. |

---

## 🔐 Security Model

- **Passwords:** Stored using bcrypt (configurable cost).
- **Authentication:** JWT Bearer tokens (HS256).
- **Authorization:** Role-based access enforcement per budget.
- **Rate Limiting:** Limits login and signup attempts per IP (short + long window).
- **Password Reset:** Tokens & OTPs stored with expiry and single-use constraints.

---

## 🧱 Database Schema Overview

Key tables:
- `users` — account info, bcrypt hash
- `budgets` — owned financial groups
- `categories` — grouped income/expense types
- `entries` — financial transactions
- `budget_members` — mapping of users to roles
- `password_resets` — temporary reset requests

---

## 🧑‍💻 Quickstart

```bash
# 1. Start MySQL
docker compose up -d

# 2. Setup environment
cp .env.example .env

# 3. Run migrations
cargo sqlx migrate run

# 4. Run API
cargo run
```

---

## 🧪 Example API Usage

```bash
# Sign up
curl -X POST http://localhost:8080/auth/signup   -H "Content-Type: application/json"   -d '{"email":"user@philand.local","name":"User","password":"StrongPass!123"}'

# Login
curl -X POST http://localhost:8080/auth/login   -H "Content-Type: application/json"   -d '{"email":"user@philand.local","password":"StrongPass!123"}'

# Get budgets (authorized)
curl -H "Authorization: Bearer <TOKEN>" http://localhost:8080/api/budgets
```

---

## 🧭 Future Enhancements

- ✅ Email/SMS delivery integration for reset flows
- ✅ Redis-based distributed rate limiter
- ⏳ Refresh tokens and session tracking
- ⏳ Export reports (CSV / PDF)
- ⏳ WebSocket real-time budget updates

---

## 📜 License

MIT © 2025 **Philand Project**
