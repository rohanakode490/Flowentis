# Agent Contract: Legacy Server / Engine (Layer 2)

## 🎯 Purpose

Serves as the monolithic integration gateway, housing action-specific compilation code, third-party API runners, and local scrapers.

---

## 📥 Inputs

- Database access via the shared Prisma Client package: [`packages/database`](../../packages/database)
- API payloads from the webhooks router.
- Local Python-based scraping code located under [`src/scrapers/python`](./src/scrapers/python).

---

## ⚙️ Process

1. **Action Compilers**: Resolves Solana transfers, triggers nodemailer emails, or executes Google Sheets cell writes.
2. **Python Spawning**: Triggers Indeed/LinkedIn job scrapers via `ChildProcess`.
3. **Local Development**: Run `npx turbo dev --filter=@flowentis/server` at the root.

---

## 📤 Outputs

- External side effects: Emails sent, Solana blockchain transactions signed and published, Google sheets modified.
- Scraped JSON payload files processed and saved to database tables.
