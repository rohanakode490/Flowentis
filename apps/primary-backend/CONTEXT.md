# Agent Contract: Primary Backend Application (Layer 2)

## 🎯 Purpose

The main Express.js REST API server serving as the core coordinator for user sessions, authentication, Zap settings CRUD, and subscription billing.

---

## 📥 Inputs

- Database access via the shared Prisma Client package: [`packages/database`](../../packages/database)
- OAuth Credentials & Payment API keys from the root environmental config.

---

## ⚙️ Process

1. **User Authentication**: Validates sessions using Passport.js with Google, GitHub, and JWT strategies.
2. **API Routes**: Exposes endpoints under [`apps/primary-backend/src/router`](./src/router) for front-end query resolution.
3. **Outbox Scheduling**: On workflow triggers or modifications, inserts records into the `ZapRunOutbox` table.
4. **Local Development**: Run `npx turbo dev --filter=@flowentis/primary-backend` at the root.

---

## 📤 Outputs

- REST API JSON payloads consumed by [`apps/frontend`](../frontend).
- Structured database updates in PostgreSQL.

---

## 🚦 Routing & Downstream

- Transactions added to `ZapRunOutbox` are picked up asynchronously by the [`apps/processor`](../processor).
