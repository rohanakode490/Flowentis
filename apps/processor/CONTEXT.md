# Agent Contract: Outbox Processor Service (Layer 2)

## 🎯 Purpose

Implements the transactional outbox pattern by polling PostgreSQL for pending `ZapRunOutbox` entries and publishing them as events to Kafka.

---

## 📥 Inputs

- `ZapRunOutbox` table records via the Prisma Client in [`packages/database`](../../packages/database).
- Local or remote Kafka connection properties.

---

## ⚙️ Process

1. **Database Polling**: Repeatedly queries the database for unprocessed `ZapRunOutbox` rows.
2. **Kafka Streaming**: Connects to the Kafka broker via `kafkajs` and publishes payload chunks to the `zap-events` topic.
3. **Outbox Deletion**: Deletes successfully streamed rows from the database in a transaction to prevent duplicates.
4. **Local Development**: Run `npx turbo dev --filter=@flowentis/processor` at the root.

---

## 📤 Outputs

- Stream events pushed to the Kafka topic `zap-events`.
- Cleaned outbox database tables.

---

## 🚦 Routing & Downstream

- Downstream consumer is the execution worker queue reader: [`apps/worker`](../worker).
