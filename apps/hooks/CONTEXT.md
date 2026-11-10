# Agent Contract: Webhook Hooks Service (Layer 2)

## 🎯 Purpose

Listens for inbound webhooks (e.g. GitHub Pull Requests, web triggers) and runs scheduled python web scraping engines to trigger new workflow instances.

---

## 📥 Inputs

- HTTP webhooks from external sources.
- Python crawling scripts in [`indeed-scraper`](./indeed-scraper) and [`linkedin-scraper`](./linkedin-scraper).
- Database access via [`packages/database`](../../packages/database).

---

## ⚙️ Process

1. **Webhook Ingestion**: Authenticates inbound webhook signatures and parses body payloads.
2. **Scraper Orchestration**: Periodically launches Python crawler processes to retrieve fresh job list datasets.
3. **Run Initialization**: Creates a new record in `ZapRun` and writes a corresponding outbox record in `ZapRunOutbox` to initialize the workflow.
4. **Local Development**: Run `npx turbo dev --filter=@flowentis/hooks` at the root.

---

## 📤 Outputs

- Written `ZapRun` and `ZapRunOutbox` database records in the PostgreSQL instance.

---

## 🚦 Routing & Downstream

- Downstream consumer is the outbox event publisher: [`apps/processor`](../processor).
