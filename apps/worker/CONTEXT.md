# Agent Contract: Workflow Execution Worker (Layer 2)

## 🎯 Purpose

The event consumer and action execution engine of FlowCatalyst, executing Zap steps in sequence.

---

## 📥 Inputs

- Event stream from Kafka `zap-events` topic.
- Solana Web3 client configuration, Google APIs scopes, and Gmail SMTP parameters.
- Database status check via [`packages/database`](../../packages/database).

---

## ⚙️ Process

1. **Kafka Consumption**: Listens for outbox events on the `zap-events` Kafka topic.
2. **Action Resolution**: Resolves the action parameters (e.g. mapping fields using current execution context).
3. **Execution**:
   - Triggers Gmail dispatches via `nodemailer`.
   - Invokes Solana blockchain transfers using `@solana/web3.js`.
   - Edits cells via Google Sheets API.
4. **Outbox Chaining**: If the Zap has subsequent steps, creates another transaction queue event to continue execution.
5. **Local Development**: Run `npx turbo dev --filter=@flowentis/worker` at the root.

---

## 📤 Outputs

- Successful execution logs in PostgreSQL (`ZapRun` status updates).
- External API responses (transactions, sent mail, updated sheets).
