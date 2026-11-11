# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

AI-powered helpdesk: support emails become tickets, AI classifies and summarizes them and drafts (or, when confident, sends) replies, and agents/admins work tickets in a web app. Students only interact by email.

Source of truth — read these instead of duplicating them here:
- `project-scope.md` — product requirements, roles, out-of-scope items, open questions
- `tech-stack.md` — **Foundation** (settled) vs **Tentative** (decided per phase) technology choices
- `implementation-plan.md` — phases and tasks, each bullet tagged with its Jira key and checkbox

Use Context7 for current library docs (Bun, Vite, React Router, Tailwind v4, Prisma 8, Express) — APIs have moved recently (e.g. Prisma 8 has no generated `PrismaClient`; queries go through `db.orm.public.<Model>`, migrations via `prisma db migrate`).

## Stack (settled)

Bun (runtime + package manager) with workspaces `client/` and `server/` (`shared/` is added only when code must be shared — HD-99); TypeScript everywhere; React + Vite + Tailwind CSS + React Router (declarative mode); Express running on Bun; PostgreSQL via Prisma 8; ESLint + Prettier; database-backed sessions. Once `shared/` exists, client/server types used on both sides live there.

## Commands

- `bun install` — install all workspaces (run at the root)
- `bun run dev` — start both workspaces: client (Vite, http://localhost:5173, proxies `/api` → server) and server (Bun watch mode on `PORT`, default 3000; `GET /api/health` → `{"status":"ok"}`)
- `bun --filter @helpdesk/client typecheck` — typecheck the client

Add commands here as tickets introduce them (lint, build, db:migrate, root typecheck).

## Working rules

- **Ask before every commit** (and before pushing). Show what will be committed and wait for the user's OK.
- **Add only what is used right away.** No placeholder folders, unused config, scaffolding, dependencies or `.gitignore`/lint entries for tools that aren't in the project yet; each ticket adds exactly what it needs, and later tickets add the rest when they use it.
- The first commit on `main` is an `Initial commit` containing a runnable project.

## Ticket workflow (follow strictly)

Work happens **one Jira ticket at a time, only when the user says to start it** ("now"); never start the next ticket on your own.

1. Branch from `main`: `hd-<n>-<slug>`. Move the Jira issue to **In Progress** (transition id `21`).
2. Implement, run the checks, commit, push, open a PR titled `HD-<n>: <summary>` (body: acceptance criteria + Jira link).
3. Move the issue to **Review** (`41`) and run the `code-reviewer` subagent (`.claude/agents/code-reviewer.md`) with the ticket key, acceptance criteria, changed files and PR number. It posts its report **on the PR and as a Jira comment**; it never edits code.
4. On CHANGES REQUESTED: fix, push, re-run the reviewer (each round is posted again).
5. Only after the reviewer approves **and** the user says OK: check the bullet in `implementation-plan.md` (`[x]`, or `[x] ~~item~~ (not doing: reason)` if dropped) in the same PR, squash-merge, delete the branch, move the issue to **Done** (`31`).

## Jira & GitHub

- Jira: site `st7-07.atlassian.net` (cloudId `574415f5-20a0-4807-82fd-c8313dbab3e7`), project `HD`. Epics HD-1…HD-10 = Phases 0–9; stories/tasks HD-11…HD-99. User-facing work is a Story, technical work is a Task.
- GitHub: **public** repo `St7-07/helpdesk` (via `gh`). Never commit `.env` files or secrets.
