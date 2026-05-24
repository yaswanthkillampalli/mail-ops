# MailOps — AI-Powered Email Operations Dashboard

> Built for the Technical Assessment: *Build an AI Agent Dashboard*

---

## What I Built

MailOps is a real-time email operations dashboard designed for a busy IT professional. It receives incoming support emails, automatically triages and analyzes them using two AI models in parallel, and presents everything in a clean single-screen interface — allowing the IT supervisor to read, reply, escalate, and assign tickets without ever leaving the dashboard.

**No hardcoded or dummy data anywhere.** Every email, analysis result, ticket, and reply is live data flowing through the system.

---

## Live Demo

- **Dashboard:** [https://mail-ops.yashcodes.tech](https://mail-ops.yashcodes.tech)
- **Inbound email:** Send any email to `support@yashcodes.tech` and watch it appear on the dashboard within seconds.

---

## Features

### 📧 Email Ingestion
- Receives emails via **Resend Inbound** webhooks
- Fetches full email body (HTML + plain text) from Resend API
- Stores raw emails in Supabase with sender info, subject, and body

### 🤖 Dual AI Analysis
Every incoming email is processed by **two AI models in parallel:**

| Model | Provider | Tasks |
|---|---|---|
| `llama-3.1-8b-instant` | Groq | Tag · Priority · Sentiment · Escalation flag |
| `gpt-oss-120b` | Cerebras | Summary · Core issue · 3 Reply suggestions |

Groq runs first (< 500ms) for instant triage. Cerebras follows with deeper analysis. Results are written to the DB as each model finishes — the UI fills in progressively.

### 🏠 Dashboard
- 4 live stat cards: Unread emails, Open tickets, Critical alerts, Resolved today
- Recent emails with **hover-to-preview** AI summary tooltip
- Pending tickets panel with priority and status
- Click any email → slide-in drawer with full analysis + one-click ticket creation

### 📬 Emails Tab (3-column layout)
- Searchable, filterable email list (by tag + priority)
- Full email detail panel with AI analysis card
- 3 AI-generated reply suggestions — click to pre-fill, edit if needed, send
- Custom reply typing also supported
- Actions: **Reply** · **Create Ticket** · **Mark as Read** · **Archive** · **Escalate**
- Replies sent via **Resend API** and logged to DB

### 🎫 Tickets Kanban
- 4 columns: Open → In Progress → Escalated → Resolved
- Move tickets between columns with arrow buttons
- Staff assignment — assign tickets to team members by specialty
- Resolving a ticket auto-stamps `resolved_at` timestamp

### 💬 Replies Log
- Full history of all sent replies
- Shows whether AI suggestion was used or manually written
- Original email context displayed alongside the reply

### 📊 AI Monitoring
- Total emails processed, Groq and Cerebras call counts
- Tag distribution — donut chart
- Priority distribution — bar chart
- Sentiment distribution — bar chart
- Model info cards with speed benchmarks

### 🎨 UI/UX
- Dark and light theme with persistent toggle
- Icon-only sidebar (maximum content space)
- DM Sans + DM Mono typography
- Auto-polling every 5 seconds for live updates

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Framework | Next.js 15 (App Router) | API routes + server components in one project |
| Language | TypeScript | Type safety across the whole stack |
| Styling | Inline CSS with CSS variables | Full theme control without a CSS framework |
| AI — Fast Triage | Groq `llama-3.1-8b-instant` | Sub-500ms classification, generous free tier |
| AI — Deep Analysis | Cerebras `gpt-oss-120b` | Rich structured output, 1M tokens/day free |
| Email Inbound | Resend Inbound + Webhooks | Webhook-based, no polling, body via API |
| Email Outbound | Resend API | Same platform, simple send API |
| Database | Supabase (PostgreSQL) | Managed Postgres with realtime support |
| Hosting | Vercel | Zero-config Next.js deployment |
| Dev Tunnel | Cloudflare Tunnel | Secure public URL for local webhook testing |
| Charts | Recharts | Lightweight, composable React charts |
| Icons | Lucide React | Consistent icon set |

---

## Architecture

```
Incoming Email
      │
      ▼
Resend Inbound (MX record → inbound-smtp.resend.com)
      │
      ▼ webhook POST
/api/webhook (Next.js API Route on Vercel)
      │
      ├─→ Fetch full email body from Resend API
      │
      ├─→ INSERT into emails table (Supabase)
      │
      ├─→ INSERT empty row into email_analysis table
      │
      ├─→ [Parallel — Promise.all]
      │     ├─→ Groq llama-3.1-8b-instant
      │     │     └─→ UPDATE email_analysis (tag, priority, sentiment, escalation)
      │     │
      │     └─→ Cerebras gpt-oss-120b
      │           └─→ UPDATE email_analysis (summary, core_issue, reply_suggestions)
      │
      ▼
Dashboard polls every 5s → UI updates automatically
```

```
Database Schema

emails
  ├── id, from_email, from_name
  ├── subject, body_text, body_html
  ├── received_at, status

email_analysis (one-to-one with emails)
  ├── tag, priority, sentiment, escalation   ← Groq
  └── summary, core_issue, reply_suggestions ← Cerebras

tickets
  ├── email_id (FK), title, tag, priority
  ├── status, assigned_to (FK → staff)
  └── created_at, resolved_at

replies
  ├── email_id (FK), reply_body
  └── sent_at, was_ai_suggestion

staff
  └── name, email, specialty, avatar_initials
```

---

## Key Design Decisions

### Why Two AI Models?
Rather than using one model for everything, I split the work by speed requirement:
- **Groq** is extremely fast (< 500ms) and perfect for simple classification — tag, priority, sentiment, escalation. The IT supervisor sees this instantly.
- **Cerebras** handles richer tasks — nuanced summarization, core issue extraction, and contextual reply suggestions using the 120B parameter model.

Running them in **parallel with `Promise.all`** means total processing time equals only the slower model, not both combined.

### Why Resend for Both Sending and Receiving?
Resend Inbound handles the full email pipeline — receiving via MX records, storing emails, and forwarding via webhooks. Using one platform for both inbound and outbound keeps the architecture simple and avoids managing IMAP/SMTP credentials separately.

### Why Groq + Cerebras Over One Provider?
- **Groq** excels at speed with small models — ideal for the instant triage step
- **Cerebras** provides 1M tokens/day free on the 120B model — far more capable for summarization and reply generation than any other free tier
- Splitting across two providers also means if one has downtime, only half the analysis is affected — core triage still works

### Why Polling Instead of WebSockets on Vercel?
Vercel runs serverless functions which don't maintain persistent connections. Supabase Realtime (WebSocket-based) works perfectly in local dev but can't hold a connection on Vercel's serverless infrastructure. A 5-second polling interval gives near-realtime feel while being fully compatible with serverless deployment.

### 10 | 30 | 60 Layout
The icon-only sidebar (10%) maximises content space. The email list (30%) gives enough room to scan subjects and badges. The detail panel (60%) has space for the full email body, AI analysis card, and action buttons — all visible without scrolling in most cases.

---

## What I'd Improve

1. **AI Agent Chat** — a natural language chat widget where the supervisor asks "summarise today's critical emails" or "show me all unresolved hardware tickets" and the agent calls internal API routes to answer with real data. Planned but deprioritised to ensure core features were solid.

2. **Email threading** — group replies and follow-ups under the same conversation thread using `message_id` and `in_reply_to` headers, already present in the Resend payload.

3. **Role-based access** — the staff table is set up but there's no auth layer. Adding Supabase Auth with row-level security would let each staff member log in and see only their assigned tickets.

4. **Similar case matching** — when a new email arrives, use vector embeddings to find previously resolved tickets with similar issues and surface them as suggested solutions.

5. **SLA breach alerts** — if a Critical ticket isn't moved from Open within 1 hour, trigger a notification via email or browser push.

6. **Mobile responsive layout** — the current 3-column layout assumes a wide screen. A mobile view would collapse to a single column with bottom navigation.

7. **Webhook signature verification** — Resend provides a webhook secret for verifying requests genuinely come from Resend. Essential before any production deployment with real users.

---

## Local Setup

```bash
# 1. Clone and install
git clone <repo-url>
cd email-dashboard
npm install

# 2. Environment variables
cp .env.example .env.local
# Fill in all values below
```

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

RESEND_API_KEY=

GROQ_API_KEY=
GROQ_MODEL=llama-3.1-8b-instant

CEREBRAS_API_KEY=
CEREBRAS_MODEL=gpt-oss-120b
```

```bash
# 3. Run locally
npm run dev

# 4. Expose webhook for local testing (optional)
cloudflared tunnel run <tunnel-name>
```

### Supabase Setup
Run the SQL in `/supabase/schema.sql` in the Supabase SQL editor to create all tables and publications.

### Resend Setup
1. Add your domain in **Resend → Domains**
2. Add MX record `inbound-smtp.resend.com` in your DNS
3. Add a webhook pointing to `https://yourdomain.com/api/webhook` with event `email.received`

### Vercel Deployment
1. Push to GitHub
2. Import project in Vercel
3. Add all environment variables in **Vercel → Settings → Environment Variables**
4. Deploy — webhook URL becomes `https://your-domain.vercel.app/api/webhook`

---

## Project Structure

```
app/
  api/
    webhook/route.ts           ← Resend inbound handler
    emails/[id]/reply/         ← Send reply via Resend
    tickets/                   ← Create + update tickets
    dashboard/                 ← Stats, emails, tickets endpoints
    monitoring/                ← AI usage stats
  dashboard/
    page.tsx                   ← Overview
    emails/page.tsx            ← Email list + detail
    replies/page.tsx           ← Sent replies log
    tickets/page.tsx           ← Kanban board
    monitoring/page.tsx        ← AI usage charts
    settings/page.tsx          ← Coming soon

components/
  Sidebar.tsx                  ← Icon navigation
  ThemeProvider.tsx            ← Dark/light theme
  EmailList.tsx                ← 30% email list panel
  EmailDetail.tsx              ← 60% email detail panel
  EmailModal.tsx               ← Dashboard quick-view drawer
  KanbanBoard.tsx              ← Tickets kanban
  TicketCard.tsx               ← Individual ticket card
  StatsBar.tsx                 ← 4 stat cards
  RecentEmails.tsx             ← Dashboard email preview
  PendingTickets.tsx           ← Dashboard ticket preview
  RepliesList.tsx              ← Replies list panel
  ReplyDetail.tsx              ← Reply detail panel
  monitoring/                  ← Chart components (modular)

llm-components/
  groq/                        ← Fast triage (tag, priority, sentiment)
  gemini/                      ← Deep analysis via Cerebras (summary, replies)

lib/
  supabase.ts                  ← Supabase clients (public + admin)
  queries.ts                   ← All DB operations
  usePolling.ts                ← Auto-refresh hook (5s interval)
```

---

*Built by Yaswanth Vardhan Killampalli*