This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Database (PostgreSQL + Drizzle)

All data lives in PostgreSQL, accessed through [Drizzle ORM](https://orm.drizzle.team). The schema is in `lib/db/schema/`.

```bash
cp .env.example .env.local        # then set JWT secrets + Google client ids
docker compose up -d              # local Postgres on 127.0.0.1:5432
pnpm install
pnpm db:generate                  # write SQL migration(s) from the schema
pnpm db:migrate                   # apply them
ADMIN_PASSWORD='…' pnpm db:create-admin you@example.com "Your Name"
pnpm db:seed-jobs                 # optional: sample job postings for recommendations
pnpm dev
```

`DATABASE_URL` must also be set wherever `next build` runs.

### JobSeeker API

All routes require a signed-in job seeker; every query is scoped to that account and returns 404 for anything that isn't theirs.

| Area | Routes |
| --- | --- |
| Profile & preferences | `GET/PUT /api/profile` |
| Recommendations | `GET /api/recommendations` |
| Applications | `GET/POST /api/jobs`, `GET/PUT/DELETE /api/jobs/:id`, `POST /api/jobs/:id/{duplicate,archive,activity}`, `POST /api/jobs/bulk/{update,delete}` |
| Stats & analytics | `GET /api/jobs/stats`, `GET /api/jobs/analytics/summary` |
| Interviews | `GET/POST /api/interviews`, `GET/PUT/DELETE /api/interviews/:id`, `GET /api/interviews/job/:jobId` |
| Resumes | `GET/POST /api/resumes`, `GET/PUT/DELETE /api/resumes/:id` |
| Saved jobs | `GET/POST /api/saved-jobs`, `GET/PUT/DELETE /api/saved-jobs/:slug` |
| Notifications | `GET /api/notifications`, `GET /api/notifications/unread-count`, `PATCH /api/notifications/:id/read`, `PATCH /api/notifications/read-all` |
| Files | `POST /api/upload` |

Application statuses are `applied`, `waiting_response`, `interviewing`, `offer`, `rejected`, `ghosted`, `completed` (one list in `lib/db/schema/application-status.ts`, enforced by the API and a database CHECK). Every status change is recorded in the application's activity timeline, and the first employer response / offer is stamped permanently, so response analytics don't change when an application later moves on.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
