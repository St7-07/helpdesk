# AI-Powered Ticket Management System

## Problem

We receive hundreds of support emails daily. Our agents manually read, classify, and respond to each ticket — which is slow and leads to impersonal, canned responses.

## Solution

Build a ticket management system that uses AI to automatically classify, respond to, and route support tickets — delivering faster, more personalized responses to students while freeing up agents for complex issues.

## Users & Roles

- **Students** — interact by email only (no login). They send emails to support and receive replies by email.
- **Agents** — log into the web app to view, work on, and reply to tickets.
- **Admins** — everything agents can do, plus user management.

## Features

- Receive support emails and create tickets
- Auto-generate human-friendly responses using a knowledge base
- Ticket list with filtering and sorting
- Ticket detail view
- AI-powered ticket classification
- AI summaries
- AI-suggested replies
- User management (admin only)
- Dashboard to view and manage all tickets

## Requirements

### Email intake
- A new support email creates a new ticket.
- A reply to an existing conversation is added to that ticket. If the ticket is Resolved or Closed, it reopens.
- Replies to students are sent by email.

### Ticket lifecycle
- Statuses: **Open → Resolved → Closed**.
- A ticket can be assigned to an agent, either manually or automatically by the AI (e.g. based on category).

### AI classification
- Each new ticket is classified into one of these categories:
  - General question
  - Technical issue
  - Billing/refund
  - Course content
  - Account/access
- Agents can override the AI-assigned category.

### AI responses
- The AI drafts a reply using the knowledge base.
- **When the AI is highly confident**, it sends the reply automatically and logs it on the ticket.
- **Otherwise**, the draft is saved as a suggested reply for an agent to review, edit and send.
- Each ticket has an AI-generated summary shown in the detail view.

### Knowledge base
- For now, the knowledge base is maintained outside the app (no in-app editing).

### Dashboard
- Ticket counts by status.
- Tickets by category.

### Authentication
- Agents and admins log in with email and password.
- Admins create and manage user accounts. There is no public sign-up.

## Out of Scope (for now)

- Student portal / student login
- Knowledge-base editing in the app
- SSO
- SLA tracking, response-time metrics, and AI auto-resolution metrics

## Open Questions

- What counts as "highly confident" for auto-sending (score threshold, specific categories only)?

Technical decisions are in [tech-stack.md](tech-stack.md).
