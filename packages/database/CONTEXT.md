# Agent Contract: Database Client & Schema (Layer 2)

## 🎯 Purpose

Manages the shared Prisma schema, handles PostgreSQL database migrations, and distributes the compiled Prisma Client across the monorepo.

---

## 📥 Inputs

- Central Prisma schema: [`packages/database/prisma/schema.prisma`](./prisma/schema.prisma)
- Database connection string `DATABASE_URL` from root `.env` or system variables.

---

## ⚙️ Process

1. **Schema Updates**: Modifying database structures must always occur directly in the central `schema.prisma` file.
2. **Synchronization**: Run `npm run db:update` at the root directory to generate the new types and push the updates directly to the database.
3. **Inspection**: Run `npm run db:studio` at the root directory to query database rows interactively.

---

## 📤 Outputs

- Schema sync changes pushed to PostgreSQL.
- Shared Prisma Client package imported by:
  - [`apps/primary-backend`](../../apps/primary-backend)
  - [`apps/hooks`](../../apps/hooks)
  - [`apps/processor`](../../apps/processor)
  - [`apps/worker`](../../apps/worker)
  - [`apps/server`](../../apps/server)
