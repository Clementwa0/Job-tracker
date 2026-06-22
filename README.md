# Job Tracker

A full-stack job application tracker with AI-assisted resume tools.

## Tech Stack

| Layer | Stack |
|-------|--------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS |
| Backend | Node.js, Express |
| Database | MongoDB (Mongoose) |
| Auth | JWT access tokens + httpOnly refresh cookies, bcrypt, Google/GitHub OAuth |

## Features

- Job application tracking (CRUD, filters, archive, activity log)
- Interview scheduling and calendar
- Analytics dashboard
- AI CV review and job description parsing (Groq)
- Resume builder with server-side persistence
- File uploads for resumes and attachments

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB
- pnpm

### Backend

```bash
cd Backend
cp .env.example .env
pnpm install
pnpm dev
```

API runs at `http://localhost:5000`.

### Frontend

```bash
cd Frontend
cp .env.example .env
pnpm install
pnpm dev
```

App runs at `http://localhost:5173`.

## Environment Variables

### Backend (`Backend/.env`)

| Variable | Description |
|----------|-------------|
| `PORT` | API port (default `5000`) |
| `CLIENT_URL` | Frontend origin for CORS and email links |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | Token signing secrets |
| `COOKIE_SECURE` | Set `true` in production (HTTPS) |
| `GROQ_API_KEY` | Groq API key for AI features |
| `GOOGLE_CLIENT_ID` / `GITHUB_CLIENT_ID` | OAuth (optional) |
| `AUTH_SECRET` | Auth.js secret (required for OAuth) |
| `SMTP_*` | Email delivery (optional; logs in dev) |

### Frontend (`Frontend/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API base URL, e.g. `http://localhost:5000/api` |

## Deployment

- **Frontend:** Build with `pnpm build`, deploy `dist/` (Vercel, Netlify, etc.). Set `VITE_API_URL` to your production API.
- **Backend:** Deploy to Render, Railway, etc. Set `CLIENT_URL`, `COOKIE_SECURE=true`, and MongoDB URI.

## License

MIT
