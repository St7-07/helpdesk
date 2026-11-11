# Tech Stack

Technical decisions for the AI-Powered Ticket Management System. For product requirements, see [project-scope.md](project-scope.md).

Only the **Foundation** below is settled. Everything under **Tentative** is a starting idea and may change when we build each part.

## Foundation (settled)

- **Language:** TypeScript (frontend and backend).
- **Runtime & package manager:** Bun (installed with Homebrew).
- **Repo layout:** Bun workspaces monorepo:
  - `client/` — React frontend
  - `server/` — Express API
  - `shared/` — shared types and schemas, added when first needed (HD-99)
- **Frontend:** React + Vite, styled with Tailwind CSS, with React Router for pages.
- **Backend:** Express, running on Bun.
- **Database:** PostgreSQL (installed locally for development), accessed through Prisma 8.
- **Authentication:** database-backed sessions stored in Postgres, with a session ID kept in an HTTP-only cookie.
- **Code quality:** ESLint + Prettier.

## Tentative (revisit when building each part)

### Frontend
- shadcn/ui components, only if needed.
- TanStack Query for fetching data.
- TanStack Table for the ticket list, React Hook Form + Zod for forms, Recharts for the dashboard.

### Backend
- Zod to validate requests.
- pg-boss for background jobs (AI processing, sending email).
- pino for logging.

### Authentication & Security
- Email + password login, passwords hashed with argon2.
- CSRF protection, helmet security headers, and rate limiting on login.

### Email
- Mailgun for incoming (webhook) and outgoing email, with webhook signatures verified.
- A reply is matched to its ticket by email headers or by a ticket ID in the subject.

### AI
- Provider: not decided. Keep AI calls behind one interface.
- Structured JSON output (category + confidence score).

### Knowledge Base
- A static file in the repo, included in the prompt as a whole.

### Testing
- Vitest, Supertest, Playwright. With Bun as the runtime, `bun test` may replace Vitest; decide in Phase 1.

### Deployment
- Docker containers on a cloud provider (not chosen yet).
- Settings come from environment variables.
