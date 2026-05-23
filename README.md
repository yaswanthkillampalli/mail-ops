# MailOps — AI-Powered Email Operations Dashboard

> Built for the Technical Assessment: *Build an AI Agent Dashboard*

---

## What I Built

MailOps is a real-time email operations dashboard designed for a busy IT professional. It receives incoming support emails, automatically triages and analyzes them using two AI models, and presents everything in a clean single-screen interface — allowing the IT supervisor to read, reply, escalate, and assign tickets without ever leaving the dashboard.

**No hardcoded or dummy data anywhere.** Every email, analysis result, ticket, and reply is live data flowing through the system in real time.

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
| `gemini-2.5-flash-lite` | Google Gemini | Summary · Core issue · 3 Reply suggestions |

Groq runs first (< 500ms) for instant triage. Gemini follows with deeper analysis (< 2s). Results stream into the DB as each model finishes — the UI fills in progressively using Supabase Realtime.

### 🏠 Dashboard
- 4 live stat cards: Unread emails, Open tickets, Critical alerts, Resolved today
- Recent emails with **hover-to-preview** AI summary tooltip
- Pending tickets panel with priority and status
- Click any email → slide-in drawer with full analysis + one-click ticket creation
- Everything updates in real time via Supabase Realtime subscriptions

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
- Staff assignment — assign tickets to team members by specialty (Network, Hardware, Software, Access, Billing)
- Resolving a ticket auto-stamps `resolved_at` timestamp

### 💬 Replies Log
- Full history of all sent replies
- Shows whether AI suggestion was used or manually written
- Original email context displayed alongside the reply

### 📊 AI Monitoring
- Total emails processed, Groq and Gemini call counts
- Tag distribution — donut chart
- Priority distribution — bar chart
- Sentiment distribution — bar chart
- Model info cards with speed benchmarks

### 🎨 UI/UX
- Dark and light theme with persistent toggle
- Icon-only sidebar (maximum content space)
- DM Sans + DM Mono typography
- Realtime updates — no manual refresh needed

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Framework | Next.js 15 (App Router) | API routes + server components in one project |
| Language | TypeScript | Type safety across the whole stack |
| Styling | Inline CSS with CSS variables | Full theme control without a CSS framework |
| AI — Fast Triage | Groq `llama-3.1-8b-instant` | Sub-500ms classification, free tier |
| AI — Deep Analysis | Google `gemini-2.5-flash-lite` | Rich structured output, generous free tier |
| Email Inbound | Resend Inbound + Webhooks | Webhook-based, no polling, body via API |
| Email Outbound | Resend API | Same platform, simple send API |
| Database | Supabase (PostgreSQL) | Realtime subscriptions out of the box |
| Realtime | Supabase Realtime | Live UI updates on DB changes |
| Tunnel | Cloudflare Tunnel | Secure public URL for webhook + demo |
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
/api/webhook (Next.js API Route)
      │
      ├─→ Fetch full email body from Resend API
      │
      ├─→ INSERT into emails table (Supabase)
      │
      ├─→ INSERT empty row into email_analysis table
      │
      ├─→ [Parallel]
      │     ├─→ Groq llama-3.1-8b-instant
      │     │     └─→ UPDATE email_analysis (tag, priority, sentiment, escalation)
      │     │
      │     └─→ Gemini gemini-2.5-flash-lite
      │           └─→ UPDATE email_analysis (summary, core_issue, reply_suggestions)
      │
      ▼
Supabase Realtime fires → Dashboard UI updates instantly
```

```
Database Schema

emails
  ├── id, from_email, from_name
  ├── subject, body_text, body_html
  ├── received_at, status

email_analysis (one-to-one with emails)
  ├── tag, priority, sentiment, escalation   ← Groq
  └── summary, core_issue, reply_suggestions ← Gemini

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
- **Groq** is extremely fast (< 500ms) and perfect for simple classification tasks — tag, priority, sentiment. The IT supervisor sees this instantly.
- **Gemini** takes slightly longer but produces richer outputs — a nuanced summary, core issue extraction, and contextual reply suggestions.

Running them in **parallel with `Promise.all`** means the total wait time is only as long as the slower model, not the sum of both.

### Why Resend for Both Sending and Receiving?
Resend Inbound launched in late 2025 and handles the full email pipeline — receiving via MX records, storing emails, and forwarding via webhooks. Using one platform for both inbound and outbound keeps the architecture simple and avoids managing IMAP/SMTP credentials separately.

### Why Supabase Realtime?
The dashboard is meant to be always-on for an IT supervisor. Polling every N seconds wastes resources and creates lag. Supabase Realtime uses PostgreSQL's logical replication to push changes to the client the moment they happen — new email arrives, analysis fills in, ticket moves — all without a page refresh.

### Why Cloudflare Tunnel?
Opening a router port exposes the machine's IP and requires firewall configuration. Cloudflare Tunnel creates a secure outbound-only connection — no open ports, no exposed IP, automatic HTTPS, and it works behind NAT. Ideal for a demo/development setup.

### 10 | 30 | 60 Layout
The icon-only sidebar (10%) maximises content space. The email list (30%) gives enough room to scan subjects and badges. The detail panel (60%) has space for the full email body, AI analysis card, and action buttons — all visible without scrolling in most cases.

---

## What I'd Improve

1. **AI Agent Chat** — a natural language chat widget where the supervisor can ask "summarise today's critical emails" or "show me all unresolved hardware tickets" and the agent calls the internal API routes to answer with real data. This was planned but deprioritised to ensure core features were solid.

2. **Email threading** — group replies and follow-ups under the same conversation thread using `message_id` and `in_reply_to` headers (already present in the Resend payload).

3. **Role-based access** — the staff table is set up but there's no auth layer. Adding Supabase Auth with row-level security would let each staff member log in and see only their assigned tickets.

4. **Similar case matching** — when a new email arrives, use vector embeddings to find previously resolved tickets with similar issues and surface them as suggested solutions. This would make reply suggestions even more accurate.

5. **SLA breach alerts** — if a Critical ticket isn't moved from Open within 1 hour, trigger a notification (email or browser push).

6. **Mobile responsive layout** — the current 3-column layout assumes a wide screen. A mobile view would collapse to a single column with bottom navigation.

7. **Webhook signature verification** — Resend provides a webhook secret for verifying that requests genuinely come from Resend. This should be added before any production deployment.

---

## Local Setup

```bash
# 1. Clone and install
git clone <repo-url>
cd email-dashboard
npm install

# 2. Environment variables
cp .env.example .env.local
# Fill in:
# NEXT_PUBLIC_SUPABASE_URL
# NEXT_PUBLIC_SUPABASE_ANON_KEY
# SUPABASE_SERVICE_ROLE_KEY
# RESEND_API_KEY
# GEMINI_API_KEY
# GEMINI_MODEL=gemini-2.5-flash-lite
# GROQ_API_KEY
# GROQ_MODEL=llama-3.1-8b-instant

# 3. Run
npm run dev

# 4. Expose via Cloudflare Tunnel (for webhook)
cloudflared tunnel run <tunnel-name>
```

### Supabase Setup
Run the SQL in `/supabase/schema.sql` in the Supabase SQL editor to create all tables and enable realtime.

### Resend Setup
1. Add your domain in Resend → Domains
2. Add the MX record `inbound-smtp.resend.com` in your DNS
3. Add a webhook pointing to `https://yourdomain.com/api/webhook` with event `email.received`

---

## Project Structure

```
app/
  api/
    webhook/route.ts          ← Resend inbound handler
    emails/[id]/reply/        ← Send reply via Resend
    tickets/                  ← Create + update tickets
    dashboard/                ← Stats, emails, tickets endpoints
    monitoring/               ← AI usage stats
  dashboard/
    page.tsx                  ← Overview
    emails/page.tsx           ← Email list + detail
    replies/page.tsx          ← Sent replies log
    tickets/page.tsx          ← Kanban board
    monitoring/page.tsx       ← AI usage charts
    settings/page.tsx         ← Coming soon

components/
  Sidebar.tsx                 ← Icon navigation
  ThemeProvider.tsx           ← Dark/light theme
  EmailList.tsx               ← 30% email list panel
  EmailDetail.tsx             ← 60% email detail panel
  EmailModal.tsx              ← Dashboard quick-view drawer
  KanbanBoard.tsx             ← Tickets kanban
  TicketCard.tsx              ← Individual ticket card
  StatsBar.tsx                ← 4 stat cards
  RecentEmails.tsx            ← Dashboard email preview
  PendingTickets.tsx          ← Dashboard ticket preview
  RepliesList.tsx             ← Replies list panel
  ReplyDetail.tsx             ← Reply detail panel
  monitoring/                 ← Chart components

lib/
  supabase.ts                 ← Supabase clients (public + admin)
  queries.ts                  ← All DB operations
  realtime.ts                 ← Supabase realtime hook
  groq/                       ← Groq classification
  gemini/                     ← Gemini analysis
```

---

*Built by Yaswanth Vardhan Killampalli*