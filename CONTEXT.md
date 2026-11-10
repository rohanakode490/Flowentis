# FlowCatalyst (Flowentis) — Task Routing & Context (Layer 1)

This file maps developer tasks to the appropriate workspace location. When any AI session starts, refer to this table to determine where to go and what localized contract to load first.

---

## 🚦 Task Routing Table

| If you want to...                                                | ...Go to                                         | ...Load First                                                          |
| ---------------------------------------------------------------- | ------------------------------------------------ | ---------------------------------------------------------------------- |
| Edit database schema, run migrations, check DB tables            | [`packages/database`](./packages/database)       | [`packages/database/CONTEXT.md`](./packages/database/CONTEXT.md)       |
| Edit shared React design system UI components                    | [`packages/ui`](./packages/ui)                   | [`packages/ui/CONTEXT.md`](./packages/ui/CONTEXT.md)                   |
| Build frontend, dashboard, visual workflow editor UI             | [`apps/frontend`](./apps/frontend)               | [`apps/frontend/CONTEXT.md`](./apps/frontend/CONTEXT.md)               |
| Modify Express backend endpoints, Auth routes, payments          | [`apps/primary-backend`](./apps/primary-backend) | [`apps/primary-backend/CONTEXT.md`](./apps/primary-backend/CONTEXT.md) |
| Write actions engine logic, scrapers, Solana, email integrations | [`apps/server`](./apps/server)                   | [`apps/server/CONTEXT.md`](./apps/server/CONTEXT.md)                   |
| Handle inbound webhooks, run scrapers via child process          | [`apps/hooks`](./apps/hooks)                     | [`apps/hooks/CONTEXT.md`](./apps/hooks/CONTEXT.md)                     |
| Manage outbox polling database queries, publish to Kafka         | [`apps/processor`](./apps/processor)             | [`apps/processor/CONTEXT.md`](./apps/processor/CONTEXT.md)             |
| Implement Kafka consumer handlers, write action logic            | [`apps/worker`](./apps/worker)                   | [`apps/worker/CONTEXT.md`](./apps/worker/CONTEXT.md)                   |

---

## ⚡ Session Start Instructions

1. **Identify the Task**: Match your objective with the routing table above.
2. **Load Global Rules**: Read [`_config/voice.md`](./_config/voice.md) and [`_config/conventions.md`](./_config/conventions.md).
3. **Transition**: Move directly to the target directory and open its localized `CONTEXT.md` to begin compilation. Do not explore unrelated folders.
