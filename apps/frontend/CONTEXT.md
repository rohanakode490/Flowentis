# Agent Contract: Frontend Application (Layer 2)

## 🎯 Purpose

A modern Next.js web application for building, visualizing, and managing automated workflow zaps.

---

## 📥 Inputs

- Shared Component Library: [`packages/ui`](../../packages/ui)
- API Interface: Primary REST endpoints exposed by [`apps/primary-backend`](../primary-backend)
- State Definition: Zustand stores defining local workspace canvas state.

---

## ⚙️ Process

1. **Interactive Workflow Builder**: Uses `react-flow` to handle drag-and-drop workflow graphs of triggers and actions.
2. **Dashboard Management**: Lists available Zaps, run history, and billing states.
3. **Payment Checkout**: Triggers payments through DodoPayments / Cashfree modals.
4. **Local Development**: Run `npx turbo dev --filter=@flowentis/frontend` at the root to spin up the local server at `http://localhost:3000`.

---

## 📤 Outputs

- Next.js pages/components matching structural routing in [`apps/frontend/src/app`](./src/app).
- User-facing visual assets, UI states, and event notifications.

---

## 🚦 Routing & Downstream

- API Calls are routed to the Express service running in [`apps/primary-backend`](../primary-backend).
