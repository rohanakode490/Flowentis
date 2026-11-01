---
title: Flowentis Server
emoji: 🚀
colorFrom: blue
colorTo: green
sdk: docker
app_port: 7860
---

# Flowentis - Enterprise Workflow Automation Platform

Flowentis is a high-performance, scalable SaaS platform designed for seamless workflow automation. Much like Zapier, Flowentis empowers users to connect disparate applications and automate repetitive tasks through "Zaps"—powerful, multi-step workflows triggered by real-time events.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Kafka](https://img.shields.io/badge/Kafka-Distributed-orange?style=flat-square&logo=apache-kafka)](https://kafka.apache.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)

## 🚀 Key Features

- **Visual Workflow Builder**: Intuitive drag-and-drop interface powered by React Flow for designing complex automations.
- **Multi-Step Zaps**: Support for workflows with multiple sequential actions and conditional logic.
- **Robust Integrations**:
  - **GitHub**: Trigger workflows based on PRs, issues, and commits.
  - **Google Sheets**: Automate data entry and spreadsheet management.
  - **Email (Gmail/Nodemailer)**: Automated notifications and communication.
  - **Web3 (Solana)**: Execute on-chain transfers and blockchain interactions.
  - **Job Scrapers**: Built-in Python scrapers for LinkedIn and Indeed.
- **Enterprise-Grade Security**: OAuth2 integration (Google/GitHub) and JWT-based authentication.
- **Integrated Payments**: Global payment support via DodoPayments and Cashfree.
- **Scalable Execution**: Event-driven architecture using Kafka for high-throughput processing.

## 🏗️ System Architecture

Flowentis is built as a modern monorepo using **Turborepo**, ensuring consistency and high performance across all services.

### Applications (`apps/`)

- **Frontend**: A sleek Next.js dashboard for building and managing Zaps.
- **Primary Backend**: The core Express.js API handling authentication, CRUD, and business logic.
- **Hooks Service**: Dedicated ingestion engine for webhooks and background tasks.
- **Processor**: Implements the Transactional Outbox pattern to ensure reliable event delivery to Kafka.
- **Worker**: The distributed execution engine that consumes Kafka events and runs workflow actions.

### Shared Packages (`packages/`)

- **Database**: Centralized Prisma schema and client for PostgreSQL.
- **UI**: A shared React component library built with Tailwind CSS and Radix UI.
- **Configuration**: Shared ESLint and TypeScript configurations.

## 🛠️ Technology Stack

- **Frontend**: Next.js (App Router), Tailwind CSS, Framer Motion, Zustand, React Flow.
- **Backend**: Node.js, Express.js, Passport.js.
- **Database**: PostgreSQL with Prisma ORM.
- **Messaging**: Apache Kafka (via KafkaJS).
- **Blockchain**: Solana Web3.js.
- **DevOps**: Docker, Turborepo.

## 🎨 UI & UX Design Rationale (Laws of UX)

The user interface and interaction flows across Flowentis were overhauled following the **Laws of UX** (Jon Yablonski). Below are the laws applied, how they were implemented, and the design rationale behind each decision:

| Law | Principle & Statement | Application & Implementation in Flowentis |
| :--- | :--- | :--- |
| **Aesthetic-Usability Effect** | *Users often perceive aesthetically pleasing design as design that’s more usable.* | Polished color palette (OKLCH variables with smooth dark/light transitions), glassmorphic navbars (`backdrop-blur-xl`), refined typography, consistent border radiuses, and structured card shadows across all dashboards. |
| **Doherty Threshold** | *Productivity soars when a computer and its users interact at a pace (<400ms) that ensures that neither has to wait on the other.* | Replaced plain-text `"loading"` states with animated `ZapTableSkeleton` components. Added interactive loading spinners (`isLoading`) with disabled states to all action buttons (Sign In, Sign Up, Save Workflow, Connect Solana, Upgrade Plan, Profile Save) ensuring feedback within 100ms. |
| **Fitts's Law** | *The time to acquire a target is a function of the distance to and size of the target.* | Standardized interactive elements to have at least **44px touch targets** (Sidebar icon buttons, Table actions, Mobile nav items). Made table workflow rows clickable to access workflow details, and physically separated destructive actions (Delete Workflow) from primary navigation. |
| **Hick's Law** | *The time it takes to make a decision increases with the number and complexity of choices.* | Streamlined authentication by visually separating the primary form submission from OAuth options with an "Or continue with" divider. Provided clean, single-CTA empty states on the Workflows page. |
| **Jakob's Law** | *Users spend most of their time on other sites. This means that users prefer your site to work the same way as all the other sites they already know.* | Implemented familiar top-left brand navigation linking home, standard top-right user actions and theme toggle, conventional form layouts with explicit labels and `autocomplete` attributes, and standard toast notifications. |
| **Law of Common Region** | *Elements tend to be perceived into groups if they are sharing an area with a clearly defined boundary.* | In the **Connections** dashboard, grouped connection status, app info, and the inline "Disconnect" action inside each app's card boundary (removing disconnected/orphaned buttons). In **Settings**, enclosed user details within a defined Card with clear boundaries. |
| **Law of Prägnanz** | *People will perceive and interpret ambiguous or complex images as the simplest form possible.* | Replaced ambiguous UI clutter with minimalist badges, clear status pills (pulsing green "Active" vs muted "Paused"), and crisp SVG icons for triggers and actions. |
| **Law of Proximity** | *Objects that are near, or proximate to each other, tend to be grouped together.* | Standardized spacing scales: tightly grouped inputs and labels (`gap-1.5`), moderate spacing within card sections (`gap-4`), and distinct margins between major page sections (`gap-8` to `gap-12`). |
| **Law of Similarity** | *The human eye tends to perceive similar elements in a design as a complete picture, shape, or group.* | Uniform visual treatment for interactive button variants across the app: solid primary background for main CTAs, outline for secondary actions, and ghost red for destructive actions. |
| **Law of Uniform Connectedness** | *Elements that are visually connected are perceived as more related than elements with no connection.* | In the Workflows table and canvas, connected triggers to actions using explicit directional arrows and unified badge chips (`[Trigger] → [Action]`), making the sequential relationship instantly understandable. |
| **Miller's Law** | *The average person can only keep 7 (plus or minus 2) items in their working memory.* | Chunked pricing features into scannable 4-5 bullet points with check icons, broken down settings into distinct sections, and provided a 3-step onboarding guide on empty workflow states. |
| **Occam's Razor** | *Entities should not be multiplied without necessity.* | Cleaned up duplicate handlers (such as redundant `onClick` on submit buttons), resolved broken navigation links (`/features` to smooth-scroll anchor `/#features`), and removed unnecessary visual noise. |
| **Pareto Principle** | *For many events, roughly 80% of effects come from 20% of the causes.* | Focused UI/UX polish on the vital 20% of user flows that drive 80% of user time: Landing/Auth, Workflow Management Dashboard, Workflow Canvas controls, and Integrations. |
| **Parkinson's Law** | *Any task will inflate until all of the available time is spent.* | Streamlined forms with sensible defaults, browser autocomplete support (`autoComplete="email"`), and automatic pre-population of user details in settings. |
| **Postel's Law** | *Be liberal in what you accept, and conservative in what you send.* | Sanitized user inputs defensively: auto-trimmed whitespaces from emails, names, and Solana private keys, and normalized email strings to lowercase. |
| **Serial Position Effect** | *Users have a propensity to best remember the first and last items in a series.* | In navigation, positioned primary workflows and features at the top/first slot, and key exit actions (Theme toggle, Docs, Sign out / Get Started) at the bottom/last slot. |
| **Tesler's Law** | *For any system there is a certain amount of complexity which cannot be reduced; it must be handled either by the system or the user.* | Shifted complexity to the backend and application state: auto-populated user profile information from `/user` on load so users don't have to re-enter data. |
| **Von Restorff Effect** | *When multiple similar objects are present, the one that differs from the rest is most likely to be remembered.* | In the Pricing section, made the **Pro** tier visually distinct with a "Most Popular" badge, primary border accent, and an elevated shadow, clearly directing user focus to the recommended option. Highlighted "+ Create Workflow" as the standout primary CTA on the dashboard. |
| **Zeigarnik Effect** | *People remember uncompleted or interrupted tasks better than completed tasks.* | Designed an empty state checklist in the Workflows dashboard displaying a 3-step setup guide ("1. Connect Integrations → 2. Build Workflow → 3. Run Automatically") encouraging users to complete their setup. |

## 🏁 Getting Started

### Prerequisites

- Node.js (>= 18)
- Docker (for Kafka and PostgreSQL)
- Python (for job scraping capabilities)

### Installation

1. Clone the repository and install dependencies:

   ```bash
   npm install
   ```

2. Configure environment variables:
   Copy `.env.example` to `.env` in the root and respective app directories.

3. Initialize the database:

   ```bash
   npm run db:update
   ```

4. Start the development environment:
   ```bash
   npm run dev
   ```

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
