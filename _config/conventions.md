# Project Conventions & Commands (Layer 3)

This configuration defines the technical specifications, development workflows, and system commands required to build, test, and maintain FlowCatalyst.

---

## 🛠️ Global Development Workflows

### Prerequisites

- **Node.js**: Version `>=18` (npm `@10.8.1` package manager preferred)
- **Docker**: Active daemon running PostgreSQL, Kafka, and Redis (via [`docker-compose.yaml`](../docker-compose.yaml))

### Core Commands

| Action                    | Command                                        | Scope                                             |
| ------------------------- | ---------------------------------------------- | ------------------------------------------------- |
| Install Dependencies      | `npm install`                                  | Monorepo root                                     |
| Start All Apps (Dev Mode) | `npm run dev`                                  | Multi-process Turborepo dev server                |
| Start Single App          | `npx turbo dev --filter=@flowentis/<app-name>` | e.g. `npx turbo dev --filter=@flowentis/frontend` |
| Sync Database Schema      | `npm run db:update`                            | Triggers Prisma generate & push                   |
| Inspect Database Tables   | `npm run db:studio`                            | Opens Prisma Studio locally                       |
| Lint Workspace            | `npm run lint`                                 | Runs ESLint check across packages                 |
| Format Workspace          | `npm run format`                               | Prettifies TypeScript/JSON/Markdown               |

---

## 🏗️ Technical Conventions

### 1. Database & Schema

- All database changes are declared in [`packages/database/prisma/schema.prisma`](../packages/database/prisma/schema.prisma).
- Never run raw DB edits directly. Always update the Prisma schema file first, and compile using `npm run db:update` to sync database structures.

### 2. Styling System

- **Frontend Components**: Built using **Tailwind CSS** and styled using **Radix UI** or Framer Motion primitives.
- Maintain CSS modularity. Avoid ad-hoc inline styles. Use pre-defined tokens and theme variables.

### 3. Messaging & Streaming

- **Kafka** is the transaction outbox broker.
- Topic name for system triggers: `zap-events`.
- Use `kafkajs` for publishing and subscribing. Ensure connections are closed gracefully on service termination.

### 4. Git Commits

- Use lowercase imperative commit messages (e.g. `feat: add email action executor`, `fix: check outbox boundary`).
