# Okleevo System Architecture & DevOps Maintenance Guide

> **Role:** Senior DevOps Engineer & Principal System Architect  
> **Platform:** Okleevo — Borderless SME Operating System & Virtual HQ  
> **Version:** 2.0 (Dual-Gateway & Layer 2 Borderless Architecture)  
> **Last Updated:** August 2026

---

## 1. Executive Summary & Technology Stack

Okleevo is built on a modern, high-performance, modular full-stack architecture designed for extreme availability, multi-tenant isolation, and low-latency real-time collaboration.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            CLIENT EXPERIENCE (UI/UX)                        │
│   Next.js 15 (App Router) • React 19 • TypeScript • Tailwind CSS • Framer   │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                           APPLICATION & API GATEWAY                         │
│     NextAuth.js v5 (Session/JWT/2FA) • Multi-Tenancy Middleware • proxy.ts   │
└──────┬─────────────┬─────────────┬─────────────┬─────────────┬──────────────┘
       │             │             │             │             │
┌──────▼──────┐┌─────▼─────┐┌──────▼──────┐┌─────▼─────┐┌──────▼──────┐┌──────▼──────┐
│  DATABASE   ││ REAL-TIME ││  PAYMENTS   ││ OBJECT S3 ││     AI      ││   EMAIL    │
│  PostgreSQL ││  LiveKit  ││   Stripe    ││   MinIO   ││    Groq     ││   Postal   │
│   Prisma    ││  Pusher   ││  Paystack   ││  ImgProxy ││   Gemini    ││  Relay/SMTP│
└─────────────┘└───────────┘└─────────────┘└───────────┘└─────────────┘└─────────────┘
```

### Component Breakdown

| Domain | Technologies Used | Responsibility & Design Decisions |
| :--- | :--- | :--- |
| **Core Framework** | Next.js 15, React 19, TypeScript 5 | Hybrid rendering (Server Components, SSR, Route Handlers). Fast page loads with minimal client-side JS bundle overhead. |
| **Styling & Motion** | Tailwind CSS 4, Framer Motion, Lucide Icons | Responsive UI, fluid animations, micro-interactions, and accessible dark/light mode themes. |
| **Authentication & Security** | NextAuth.js v5, bcryptjs, JWT, Email OTP 2FA | Workspace multi-tenancy, Role-Based Access Control (Owner, Admin, Manager, Member), Layer 2 guest token isolation. |
| **Database & ORM** | PostgreSQL, Prisma ORM (v6) | Relational data persistence, schema migrations, and strict referential integrity across business boundaries. |
| **Video, Audio & Realtime** | LiveKit WebRTC, Pusher Channels | Low-latency WebRTC video calls, screen sharing, live presence, active typing indicators, and instant notification feeds. |
| **Payment Gateways** | Stripe + Paystack Dual Engine | **Stripe** for Global (GBP, USD, EUR) + **Paystack** for African markets (NGN, GHS, KES, ZAR, USD via Verve, M-Pesa, MTN MoMo, Bank Transfer, USSD). |
| **AI Intelligence** | Groq (Llama 3.3 70B), Google Gemini (2.5 Flash) | AI Content Studio, automated HMRC/VAT expense & receipt validation, AI meeting notes synthesis. |
| **Storage & Object CDN** | MinIO / S3, ImgProxy | Zero-trust isolated buckets (`okleevo-uploads` for internal workspaces vs `okleevo-client-sandbox` for Layer 2 guest uploads), dynamic image optimization. |
| **Mail Infrastructure** | Postal Mail Server API, Nodemailer SMTP | High-deliverability transactional emails, calendar invites (.ics), customer support ticketing, and campaign broadcasts. |

---

## 2. Codebase Organization & Directory Structure

The repository adheres to a **Domain-Driven Modular Structure** to ensure maintainability as the platform grows:

```
okleevo/
├── app/                                    # Next.js App Router (UI & API endpoints)
│   ├── (public)/                           # Marketing landing pages, terms, privacy
│   ├── book/[businessId]/[slug]/           # Layer 2 public branded booking pages
│   ├── booking/[businessId]/               # Legacy public booking request pages
│   ├── room/[appointmentId]/               # Dedicated WebRTC meeting room (Host & Guest)
│   ├── helpdesk/[businessId]/              # Public customer support ticket portal
│   ├── dashboard/                          # Authenticated SME workspace modules
│   │   ├── activity/                       # Real-time workspace audit & activity feed
│   │   ├── ai-notes/                       # AI-assisted smart note-taking
│   │   ├── booking/                        # Appointments, scheduling & room controls
│   │   ├── campaigns/                      # Email marketing & broadcast manager
│   │   ├── crm/                            # Contact management & sales pipeline
│   │   ├── expenses/                       # Receipts, VAT calculator & ledger sync
│   │   ├── invoices/                       # Multi-currency invoicing & payment links
│   │   ├── projects/                       # Projects, milestones & profitability
│   │   ├── settings/                       # Workspace preferences, team & billing
│   │   └── tasks/                          # Kanban & sprint task management
│   └── api/                                # Route Handlers grouped by business domain
│       ├── billing/                        # Stripe & Paystack checkout, portal & status
│       ├── bookings/                       # Appointment CRUD, calendar availability
│       ├── cron/                           # Scheduled tasks (reminders, auto-archive)
│       ├── livekit/                        # LiveKit token issuing for team rooms
│       ├── paystack/                       # Paystack transaction verification & plans
│       ├── public/                         # Zero-login Layer 2 guest endpoints
│       └── webhooks/                       # Asynchronous webhooks (Stripe, Paystack, Postal)
├── components/                             # Reusable React components
│   ├── collaboration/                      # LiveKit video room, tracks & timer controllers
│   ├── dashboard/                          # Metric cards, widgets & activity feeds
│   ├── hooks/                              # Custom React hooks (usePresence, etc.)
│   └── ui/                                 # Primitives (Modals, Badges, Dropdowns, Tabs)
├── config/                                 # Strict runtime environment variable parsing
├── lib/                                    # Core business logic, SDKs & Services
│   ├── api/                                # withMultiTenancy wrapper & request guards
│   ├── auth/                               # NextAuth configurations, onboarding handlers
│   ├── paystack/                           # Paystack API client, billing & webhook verify
│   ├── stripe/                             # Stripe SDK, global tiers & customer management
│   ├── services/                           # MinIO S3 storage, Postal mailer, LiveKit tokens
│   ├── security/                           # Guest tokens, PIN hashing, data encryption
│   └── prisma.ts                           # Shared Prisma singleton instance
├── prisma/                                 # schema.prisma & database migration history
└── proxy.ts                                # Edge routing, route gating & public exemptions
```

---

## 3. Core Architectural Principles & Invariants

### A. Multi-Tenant Isolation Rule (`withMultiTenancy`)
* **Standard:** Internal API routes under `/api/*` (except public/webhooks) must wrap their handlers in `withMultiTenancy()`.
* **Guardrail:** Never query, update, or delete records using only a row `id`. Always include `businessId: user.businessId` in the `where` clause to prevent cross-tenant data leakage.

### B. Layer 2 Zero-Trust Guest Sandbox
* Unauthenticated meeting guests (`/room/[appointmentId]`) must **never** be issued a NextAuth session cookie.
* **Security Model:** Access is granted solely through 6-digit PIN verification which returns a short-lived room-scoped JWT token. Uploads are strictly stored in the isolated `okleevo-client-sandbox` MinIO bucket.

### C. Stateless & Idempotent Webhook Listeners
* Webhook endpoints (`/api/webhooks/stripe`, `/api/webhooks/paystack`, `/api/webhooks/postal`) are public and self-gating.
* Every incoming request must validate HMAC SHA signatures (`Stripe-Signature` or `x-paystack-signature`) before processing payload events.

---

## 4. DevOps, Deployment & Maintenance Guide

### A. Local Development Environment
```bash
# 1. Install dependencies
npm install

# 2. Sync database schema
npx prisma generate
npx prisma db push

# 3. Start development server
npm run dev
```

### B. Continuous Integration (CI) Quality Gates
All pull requests must pass the following automated checks prior to merge:
```bash
# Type-safety verification (0 errors required)
npx tsc --noEmit

# Linting & code standards
npm run lint

# Prisma schema validation
npx prisma validate
```

### C. Production Build & Containerization
* **Standalone Build:** Next.js outputs a standalone Node.js server bundle via `output: 'standalone'` in `next.config.ts`.
* **Docker Multi-Stage Container:**
  1. `deps`: Install production dependencies.
  2. `builder`: Build application (`npm run build`).
  3. `runner`: Minimal Alpine runtime (~120MB image) running unprivileged user.

### D. Observability & Health Monitoring
* **Health Check Endpoint:** `GET /api/health` validates database connection, MinIO connectivity, and mailer availability.
* **Logging Standard:** Structured JSON logging in production for ingestion into CloudWatch, Datadog, or Grafana Loki.
* **Error Tracking:** Centralized crash reporting and stack tracing via Sentry.

### E. Backup & Disaster Recovery (DR)
* **PostgreSQL:** Automated hourly WAL archiving with daily full snapshots retained for 30 days.
* **Object Storage:** Cross-region MinIO/S3 bucket replication enabled for `okleevo-uploads`.
