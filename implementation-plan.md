# Implementation Plan

Built from [project-scope.md](project-scope.md) and [tech-stack.md](tech-stack.md). Each phase ends with something working that can be demoed. Choices marked *tentative* in the tech stack are made in the phase that first needs them.

**Jira:** [Helpdesk board](https://st7-07.atlassian.net/jira/software/projects/HD/boards). Each phase is an epic, and each bullet links to its story or task.

**Workflow per ticket** (details in `CLAUDE.md`): branch `hd-<n>-<slug>` + Jira In Progress → PR → Jira Review, where the `code-reviewer` agent posts its report on the PR and in Jira → fix and re-review → after approval and the user's OK: box checked here, squash-merge, Jira Done.

**Legend:**
- `[ ]` to do
- `[x]` done
- `[x] ~~item~~ (not doing: reason)` decided not to do

## Phase 0 — Project Setup · [HD-1](https://st7-07.atlassian.net/browse/HD-1)

- [x] HD-11 Create the Bun workspaces monorepo with a runnable `server/` (Express, `GET /api/health`); `shared/` comes in HD-99
- [ ] HD-12 Add a shared TypeScript config (`tsconfig.base.json`) and per-package configs
- [ ] HD-13 Add ESLint + Prettier
- [x] HD-14 Scaffold `client/` with React + Vite and add it as a workspace (minimal page showing the API status)
- [ ] HD-15 Add Tailwind CSS to the client
- [ ] HD-16 Add React Router with placeholder pages (Login, Tickets, Ticket Detail, Dashboard, Users)
- [ ] HD-17 Complete the Express setup: JSON body parsing, JSON 404 for unknown `/api` routes, and a central error handler (base server and `/api/health` come from HD-11)
- [x] HD-18 Set up the Vite dev proxy from `/api` to the Express server
- [ ] HD-19 Load environment variables from `.env` and add `.env.example`
- [x] HD-20 Create the local Postgres database and connect Prisma 8 to it
- [ ] HD-21 Add root Bun scripts: `build`, `lint`, `typecheck`, `format`, `db:migrate` (root `dev` ships with the initial commit)
- [ ] HD-22 Complete the README with full setup steps (database, env vars, all scripts); a minimal README ships with the initial commit

**Done when:** `bun run dev` starts both apps and the client shows the health check result.

## Phase 1 — Authentication · [HD-2](https://st7-07.atlassian.net/browse/HD-2)

- [ ] HD-23 Prisma: `User` model (name, email, password hash, role `ADMIN | AGENT`, active flag)
- [x] HD-24 Prisma: `Session` model for database sessions
- [ ] HD-25 Choose a password hashing library (argon2 is *tentative*)
- [x] HD-26 Set up database-backed session middleware and HTTP-only cookie settings
- [ ] HD-27 Seed script that creates the first admin
- [ ] HD-28 `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
- [ ] HD-29 Middleware: `requireAuth` and `requireAdmin`
- [ ] HD-30 Rate limiting on login
- [ ] HD-31 Client: login page and form
- [ ] HD-32 Client: auth context, protected routes, redirect to login
- [ ] HD-33 Client: app layout with navigation and a logout button
- [ ] HD-34 Tests: login, logout and protected routes

**Done when:** the seeded admin can log in, see protected pages, and log out.

## Phase 2 — User Management (admin only) · [HD-3](https://st7-07.atlassian.net/browse/HD-3)

- [ ] HD-35 `GET /api/users`: list users
- [ ] HD-36 `POST /api/users`: create an agent or admin
- [ ] HD-37 `PATCH /api/users/:id`: edit name or role, deactivate or reactivate
- [ ] HD-38 Deactivating a user deletes their sessions
- [ ] HD-39 Prevent an admin from deactivating or demoting themselves
- [ ] HD-40 Client: users list page
- [ ] HD-41 Client: create and edit user form
- [ ] HD-42 Hide the Users navigation link for agents
- [ ] HD-43 Tests: admin-only access, and that deactivation revokes access

**Done when:** an admin can create agents who can then log in.

## Phase 3 — Tickets Core (no email or AI yet) · [HD-4](https://st7-07.atlassian.net/browse/HD-4)

- [ ] HD-44 Prisma: `Ticket` model (subject, student email/name, status, category, assignee, summary, timestamps)
- [ ] HD-45 Prisma: `Message` model (ticket, direction inbound/outbound, author: student/agent/AI, body, email message ID)
- [ ] HD-99 Add the `shared/` workspace package (first needed here)
- [ ] HD-46 Shared enums and types: status (Open, Resolved, Closed) and the five categories
- [ ] HD-47 Seed script with sample tickets and messages
- [ ] HD-48 `GET /api/tickets`: list with filters (status, category, assignee) and sorting, with pagination
- [ ] HD-49 `GET /api/tickets/:id`: ticket and its messages
- [ ] HD-50 `PATCH /api/tickets/:id`: change status, category or assignee
- [ ] HD-51 Tests: ticket API endpoints

**Done when:** the ticket API returns the seeded data with filtering and sorting working.

## Phase 4 — Ticket UI · [HD-5](https://st7-07.atlassian.net/browse/HD-5)

- [ ] HD-52 Set up a data-fetching approach (TanStack Query is *tentative*)
- [ ] HD-53 Ticket list page: table with status, category, assignee, student and date columns
- [ ] HD-54 Ticket list: filter controls and sortable columns
- [ ] HD-55 Ticket list: pagination
- [ ] HD-56 Ticket detail page: header (subject, student, status, category, assignee)
- [ ] HD-57 Ticket detail: message thread
- [ ] HD-58 Ticket detail: controls to change status, category and assignee
- [ ] HD-59 Ticket detail: reply box (saves an outbound message; sending email comes in Phase 6)
- [ ] HD-60 Loading, empty and error states

**Done when:** agents can browse, filter, open and update tickets in the browser.

## Phase 5 — Inbound Email · [HD-6](https://st7-07.atlassian.net/browse/HD-6)

- [ ] HD-61 Choose the email provider (Mailgun is *tentative*) and set up a dev domain or route
- [ ] HD-62 `POST /api/webhooks/email`: receive inbound emails
- [ ] HD-63 Verify the webhook signature
- [ ] HD-64 Parse the sender, subject, body (prefer plain text, strip quoted replies) and message IDs
- [ ] HD-65 Match a reply to its existing ticket by `In-Reply-To`/`References` or a ticket ID in the subject; add it and reopen the ticket if it was Resolved or Closed
- [ ] HD-66 Create a new ticket for anything that doesn't match
- [ ] HD-67 Ignore duplicate deliveries (same message ID)
- [ ] HD-68 Tests: new ticket, threaded reply, reopen, duplicate and bad signature
- [ ] HD-69 Expose the local server for webhook testing (e.g. a tunnel)

**Done when:** sending a real email creates a ticket, and replying adds a message to the same ticket.

## Phase 6 — Outbound Email · [HD-7](https://st7-07.atlassian.net/browse/HD-7)

- [ ] HD-70 Email-sending service (behind an interface)
- [ ] HD-71 Send agent replies to the student with threading headers and the ticket ID in the subject
- [ ] HD-72 Store the outgoing message ID so student replies can be threaded
- [ ] HD-73 Set up background jobs for sending, with retries (pg-boss is *tentative*)
- [ ] HD-74 Show the send status on each message (queued, sent, failed)
- [ ] HD-75 Tests: sending and threading

**Done when:** an agent's reply arrives in the student's inbox, and the student's response threads back into the ticket.

## Phase 7 — AI Features · [HD-8](https://st7-07.atlassian.net/browse/HD-8)

- [ ] HD-76 Choose the AI provider
- [ ] HD-77 AI service interface (`classify`, `summarize`, `draftReply`) with a mock version for development and tests
- [ ] HD-78 Create the knowledge-base file in the repo
- [ ] HD-79 Classification: returns a category and a confidence score; run it on each new ticket
- [ ] HD-80 Summary: generate it for new tickets and update it when new messages arrive; show it on the detail page
- [ ] HD-81 Suggested reply: draft it from the knowledge base and save it on the ticket
- [ ] HD-82 Client: show the suggested reply in the reply box for an agent to edit and send
- [ ] HD-83 Auto-assign tickets to agents (rule to be decided, e.g. by category or workload)
- [ ] HD-84 **Decide the auto-send rule** (confidence threshold and/or allowed categories)
- [ ] HD-85 Auto-send: if the rule passes, send the AI reply and record it as an AI message
- [ ] HD-86 Run all AI work as background jobs; a failure must never block ticket creation
- [ ] HD-87 Tests: using the mock AI (classification, drafting, the auto-send rule)

**Done when:** a new email is automatically classified and summarized, and gets a reply, either sent automatically or drafted for an agent.

## Phase 8 — Dashboard · [HD-9](https://st7-07.atlassian.net/browse/HD-9)

- [ ] HD-88 `GET /api/dashboard/stats`: ticket counts by status and by category
- [ ] HD-89 Client: dashboard page with stat cards and a category breakdown
- [ ] HD-90 Links from dashboard numbers to the filtered ticket list

**Done when:** the dashboard reflects live ticket data.

## Phase 9 — Hardening & Deployment · [HD-10](https://st7-07.atlassian.net/browse/HD-10)

- [ ] HD-91 Security headers, CSRF protection and a final check of cookie settings
- [ ] HD-92 Structured logging and error-handling middleware
- [ ] HD-93 End-to-end tests for the main flows (login, view ticket, reply)
- [ ] HD-94 Dockerfiles for the API (which serves the built client) and the worker
- [ ] HD-95 Run database migrations when the app is deployed
- [ ] HD-96 Choose the cloud provider; set up managed Postgres and secrets
- [ ] HD-97 Deploy, and point the email provider's webhook at production
- [ ] HD-98 Production smoke test with a real email
