# Helpdesk

AI-powered ticket management system: support emails become tickets, AI classifies, summarizes and drafts replies, and agents work the tickets in a web app.

See [project-scope.md](project-scope.md) for the requirements, [tech-stack.md](tech-stack.md) for technology choices and [implementation-plan.md](implementation-plan.md) for progress.

## Requirements

- [Bun](https://bun.sh) (`brew install oven-sh/bun/bun`)

## Getting started

```sh
bun install
bun run dev
```

This starts both workspaces:

- **client** (React + Vite) on http://localhost:5173. The page shows the API status.
- **server** (Express on Bun) on http://localhost:3000 (set `PORT` to change it).

In development, Vite proxies `/api` requests to the server. To check the server directly:

```sh
curl http://localhost:3000/api/health
# {"status":"ok"}
```
