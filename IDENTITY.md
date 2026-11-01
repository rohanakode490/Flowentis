# FlowCatalyst (Flowentis) — Workspace Identity (Layer 0)

Welcome to the FlowCatalyst (Flowentis) workflow automation platform workspace. This file establishes the high-level identity, folder architecture, and spatial orientation of the project to guide any AI developer or agent working in this codebase.

---

## 🎯 Workspace Purpose

FlowCatalyst is a powerful workflow automation platform, similar to Zapier, that connects various applications and automates tasks through "Zaps." It supports complex workflows with triggers and multiple actions, including integrations with GitHub, Google Sheets, Email, and Solana.

---

## 📂 Folder Map & Agent Boundaries

The project is structured as a monorepo using **Turborepo**. Each subdirectory contains its own source code, configurations, and a localized `CONTEXT.md` (Layer 2 Agent Contract) that defines its inputs, outputs, processes, and interfaces.

- **Project Root**: `./`
  - `IDENTITY.md` — _You are here_ (Layer 0)
  - [`CONTEXT.md`](./CONTEXT.md) — Routing table and task selection (Layer 1)
  - [`_config/`](./_config) — Reference conventions and voice guidelines (Layer 3)
- **Applications** ([`apps/`](./apps)):
  - [`frontend`](./apps/frontend) — Next.js frontend, visual builder, state management (Zustand, React Flow)
  - [`primary-backend`](./apps/primary-backend) — Express API server, OAuth/JWT auth, payment processor (DodoPayments, Cashfree)
  - [`server`](./apps/server) — Monolithic legacy backend and actions engine
  - [`hooks`](./apps/hooks) — Webhook ingestion endpoints and scheduled scraping runners
  - [`processor`](./apps/processor) — Outbox polling service that publishes events to Kafka
  - [`worker`](./apps/worker) — Core execution engine consuming events from Kafka and triggering actions
- **Shared Packages** ([`packages/`](./packages)):
  - [`database`](./packages/database) — Prisma schema definitions, migrations, and shared client
  - [`ui`](./packages/ui) — React design system components
  - [`eslint-config`](./packages/eslint-config) / [`typescript-config`](./packages/typescript-config) — Shared linter and typescript parameters

---

## ⚙️ Zap Execution Stage Flow

A "Zap" workflow progresses through the following sequential stages:

| Stage                   | Process Name         | Component Location                   | Purpose                                                                                       |
| ----------------------- | -------------------- | ------------------------------------ | --------------------------------------------------------------------------------------------- |
| **1. Ingest / Trigger** | Webhook / Scraper    | [`apps/hooks`](./apps/hooks)         | Catch trigger data (webhooks, python scraper results) and insert into Database outbox         |
| **2. Poll Outbox**      | DB outbox polling    | [`apps/processor`](./apps/processor) | Pull pending actions from `ZapRunOutbox` and publish them to Kafka                            |
| **3. Dispatch**         | Message Queue Broker | Kafka Service (via Docker)           | Stream run events reliably to consumers                                                       |
| **4. Execute**          | Action Execution     | [`apps/worker`](./apps/worker)       | Consume events and invoke actions (Solana transaction, Google Sheet edit, Gmail notification) |

---

## 📜 Basic Rules of Engagement

1. **Never explore blindly**: Check the root [`CONTEXT.md`](./CONTEXT.md) routing table to determine which sub-directory is responsible for your assigned task.
2. **Follow Layer 2 Contracts**: When working inside a sub-app or package, adhere strictly to the inputs, processes, and outputs described in that folder's `CONTEXT.md`.
3. **Respect Code Conventions**: Consult [`_config/conventions.md`](./_config/conventions.md) and [`_config/voice.md`](./_config/voice.md) before writing code.
