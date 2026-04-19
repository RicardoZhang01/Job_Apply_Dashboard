# Job Apply Dashboard

中文版: [README.md](README.md)

A web platform for students and new graduates to manage job applications end-to-end, from tracking and execution to analytics and AI-assisted decision support.

## Table of Contents

- [Overview](#overview)
- [Core Features](#core-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Common Scripts](#common-scripts)
- [Routes](#routes)
- [API Overview](#api-overview)
- [AI Notes](#ai-notes)
- [Demo Flow](#demo-flow)
- [Roadmap](#roadmap)
- [Contributing](#contributing)

## Overview

This project is not just a status board. It focuses on:

- **Execution-first workflow**: dashboard surfaces what to do today
- **Structured knowledge capture**: JD notes, interview prep, material versions, failure tags
- **Review and strategy loop**: channels, stages, and outcome analytics
- **Embedded AI**: AI actions are integrated into real user workflows

## Core Features

### 1) Workflow Management

- Drag-and-drop Kanban status updates
- List search and filtering
- Deadline, written test, and interview schedule tracking
- Application timeline and history

### 2) Decision Support

- "Today Todos" aggregation on dashboard
- Rule-based next-step hints
- Grouped reminders with read/unread actions

### 3) Analytics

- Status distribution, funnel, and trend views
- Channel interview rate / offer rate
- Job category and failure reason breakdown

### 4) AI (On-demand)

- JD extraction and autofill
- Next-action suggestions per application
- Interview preparation suggestions
- Resume/cover letter suggestions
- Stats insight and dashboard daily digest

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS, TanStack Query, dnd-kit, Recharts
- **Backend**: NestJS, Prisma
- **Database**: SQLite (local default)
- **Auth**: JWT + HttpOnly Cookie
- **CI**: GitHub Actions (`.github/workflows/ci.yml`)

## Project Structure

| Path | Description |
|------|-------------|
| [backend/](backend/) | NestJS + Prisma REST API (`/api` prefix) |
| [frontend/](frontend/) | Next.js frontend app |
| [docs/TECH_DECISIONS.md](docs/TECH_DECISIONS.md) | Technical decisions |

## Quick Start

### Option A: One-click scripts (recommended)

- **Windows**: double-click [`start.bat`](start.bat)
- **Mac / Linux**: `chmod +x start.sh && ./start.sh`

### Option B: CLI

```bash
npm install
npm run install:all
npm run setup
npm run dev
```

After startup:

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:3001/api`

Register a new account on first launch.

## Environment Variables

> If env files are missing, `npm run setup` can copy them from examples.

### Backend (`backend/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | SQLite connection string | `file:./dev.db` |
| `JWT_SECRET` | JWT secret key | - |
| `FRONTEND_ORIGIN` | Allowed CORS origin | `http://localhost:3000` |
| `PORT` | Backend port | `3001` |
| `OPENAI_API_KEY` | AI key (optional) | empty |
| `OPENAI_BASE_URL` | OpenAI-compatible endpoint | `https://api.openai.com/v1` |
| `OPENAI_MODEL` | Model name | `gpt-4o-mini` |

### Frontend (`frontend/.env.local`)

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend base URL | `http://localhost:3001` |

## Common Scripts

### Root

| Command | Description |
|---------|-------------|
| `npm run dev` | Start frontend and backend in dev mode |
| `npm run setup` | Copy env files, run migration, generate Prisma client |
| `npm run env:copy` | Copy env files only |

### Sub-projects

| Command | Description |
|---------|-------------|
| `backend: npm run build` | Build backend |
| `backend: npm test` | Unit tests |
| `backend: npm run test:e2e` | E2E tests |
| `frontend: npm run build` | Frontend production build |

## Routes

| Route | Description |
|-------|-------------|
| `/` | Auth check and redirect |
| `/dashboard` | Dashboard |
| `/board` | Kanban board |
| `/list` | Application list |
| `/reminders` | Reminder center |
| `/stats` | Analytics |
| `/applications/new` | Full create form |
| `/applications/new/quick` | Quick create |
| `/applications/:id` | Application detail |
| `/applications/:id/edit` | Edit application |

## API Overview

- `POST /api/auth/register|login|logout`
- `GET /api/auth/me`
- `GET|POST /api/applications`
- `GET|PUT|DELETE /api/applications/:id`
- `PATCH /api/applications/:id/status`
- `GET|POST /api/applications/:id/history`
- `GET /api/reminders`
- `PATCH /api/reminders/read`
- `GET /api/dashboard/todos`
- `GET /api/stats/overview|funnel|channels|trends`
- `GET /api/stats/channel-effectiveness|by-job-category|failure-breakdown`
- `POST /api/ai/jd-extract|next-actions|resume-suggest|interview-prep|stats-insight`
- `GET /api/ai/dashboard-digest`

## AI Notes

- AI requests go through backend (no API key exposed in frontend)
- AI is **on-demand only** (triggered by explicit user actions)
- Responses focus on suggestions with rationale
- If AI is unavailable, the app returns user-friendly reasons and manual flow still works

## Demo Flow

Suggested 3-5 minute demo:

1. `/applications/new/quick`: run AI JD extraction and autofill
2. `/applications/:id`: run AI next-action + interview prep
3. `/dashboard`: generate AI daily digest
4. `/stats`: run AI stats insight
5. `/applications/:id/edit`: generate AI resume/cover letter suggestions

## Roadmap

- [ ] Persist AI artifacts with traceability and caching
- [ ] Finer-grained AI cost and rate-limit governance
- [ ] Richer analytics reports and export
- [ ] Optional conversational AI coach

## Contributing

Issues and pull requests are welcome.

Suggested flow:

1. Fork and create a feature branch
2. Commit changes with tests/screenshots
3. Open a PR describing scope and impact

---

If this project helps you, a Star is appreciated.
