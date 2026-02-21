# Job Tracker - Architecture & Refactoring Guide

## Suggested Folder Structure (Feature-Based)

```
src/
├── config/                 # App configuration
│   └── env.ts              # Environment variables with validation
├── types/                  # Shared TypeScript types
│   ├── index.ts            # Centralized type definitions
│   └── job.ts              # Re-exports (backward compat)
├── lib/                    # Core utilities
│   ├── api-client.ts       # Centralized HTTP client (replaces api.ts + axios)
│   ├── utils.ts
│   ├── validation.ts
│   └── calendar-utils.ts
├── features/               # Feature modules
│   ├── auth/
│   │   └── api/
│   │       └── auth-api.ts
│   └── jobs/
│       ├── api/
│       │   └── jobs-api.ts
│       └── utils/
│           └── job-mappers.ts
├── hooks/                  # React hooks & context
│   ├── AuthContext.tsx
│   ├── JobContext.tsx
│   └── use-toast.ts
├── components/
│   ├── shared/             # Reusable primitives
│   │   ├── LoadingSpinner.tsx
│   │   ├── PageSkeleton.tsx      # Deprecated - use skeletons/
│   │   └── skeletons/
│   │       ├── index.ts
│   │       ├── SkeletonPrimitives.tsx  # SkeletonText, SkeletonHeader, SkeletonStatCard, etc.
│   │       ├── JobsPageSkeleton.tsx
│   │       ├── DashboardPageSkeleton.tsx
│   │       └── AnalyticsPageSkeleton.tsx
│   ├── ui/                 # Design system components
│   ├── layout/
│   └── pages/              # Route-level components
└── constants/
```

## Architectural Improvements

### 1. Clean Architecture

| Before | After |
|--------|-------|
| Job type in 3 places (JobsTable, job.ts, types/job.ts) | Single source in `@/types` |
| Dual API clients (fetch in api.ts + axios) | Unified `apiClient` + `api` wrapper |
| Business logic in components | `features/*/api` + `features/*/utils` |
| Scattered error handling | `ApiClientError` + centralized `getErrorMessage()` |

### 2. TypeScript Excellence

- **Eliminated `any`** in JobContext, AddJob, Calendar, Profile, Resume, fileParsers, resetPassword, forgetPassword
- **Strongly typed API responses** via `ApiResponse<T>`, `BackendJob`, `CreateJobRequest`
- **Centralized types** in `src/types/index.ts` for Job, User, Interview, BackendJob

### 3. Performance

- **React.lazy** for all route components (Dashboard, Jobs, Calendar, etc.)
- **Suspense** with `FullPageLoader` fallback
- **Code splitting** reduces initial bundle; each route loads on demand
- **Removed** redundant `react-helmet` (keep only `react-helmet-async`)
- **Consider removing** `react-big-calendar` if only FullCalendar is used

### 4. Data Layer

- **Centralized API client** in `lib/api-client.ts` with typed `get/post/put/delete`
- **Feature APIs** in `features/auth/api` and `features/jobs/api`
- **Job mappers** in `features/jobs/utils/job-mappers.ts` for backend ↔ frontend
- **Error handling** via `ApiClientError` with status code and field errors

### 5. UX

- **Skeleton loaders** for Jobs list when loading
- **FullPageLoader** for auth and route transitions
- **LoadingSpinner** shared component
- **Accessibility** via `role="status"`, `aria-label` on loaders

### 6. Security

- **Env validation** in `config/env.ts` – fails in production if `VITE_API_DB_URL` missing
- **Safe defaults** in development
- **Input validation** via Zod (login, register) – extend to job forms as needed

---

## Critical Architectural Flaws (Addressed)

### 1. **Dual API Clients**
- **Problem**: `api.ts` (fetch) and `axios.ts` used interchangeably caused inconsistent error handling and token attachment.
- **Fix**: Single `apiClient` with `api` wrapper for axios-compatible `{ data }` shape.

### 2. **Type Fragmentation**
- **Problem**: Job interface defined in JobsTable, job.ts, and types – led to `interviews: never[]` vs `Interview[]` mismatches.
- **Fix**: Single `Job` type in `@/types` with `BackendJob` for API responses.

### 3. **AuthContext Returns `null` During Load**
- **Problem**: `if (isLoading) return null` caused blank screen and poor UX.
- **Fix**: Render a loading spinner with `aria-label` for accessibility.

### 4. **No Code Splitting**
- **Problem**: All routes bundled together; large initial load for 100k+ users.
- **Fix**: `React.lazy` + `Suspense` for route-level splitting.

### 5. **Unsafe `any` in Error Handlers**
- **Problem**: `catch (err: any)` and `err.response?.data?.message` bypassed type safety.
- **Fix**: `error instanceof Error` and `ApiClientError` for API errors.

### 6. **Environment Variables**
- **Problem**: Direct `import.meta.env.VITE_*` with no validation could fail silently.
- **Fix**: `config/env.ts` with validation and dev defaults.

---

## React Query Integration (Recommended)

For 100k+ users, add `@tanstack/react-query`:

```ts
// Example: useJobsQuery
const { data, isLoading, error, refetch } = useQuery({
  queryKey: ['jobs'],
  queryFn: fetchJobs,
  staleTime: 60_000,
});
```

Benefits: caching, background refetch, optimistic updates, request deduplication.

---

## Bundle Optimization Checklist

- [x] React.lazy for routes
- [ ] Remove `react-big-calendar` if unused
- [ ] Remove `react-helmet` (keep `react-helmet-async`)
- [ ] Analyze with `pnpm run build -- --report`
- [ ] Consider dynamic imports for FullCalendar, Recharts (heavy libs)

---

## Scalability Notes

- **Pagination**: Current JobContext loads all jobs. For 100k+ users, add pagination/infinite scroll and backend support.
- **Optimistic UI**: JobContext mutations can be extended with optimistic updates before API response.
- **Caching**: React Query or SWR will reduce redundant fetches across tabs/navigation.
