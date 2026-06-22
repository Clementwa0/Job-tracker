/** Personal application tracker (Phase 1 CRM) */
export const TRACKER_ROUTES = {
  list: "/applications",
  add: "/applications/add",
  edit: (id: string) => `/applications/edit/${id}`,
} as const;

/** Public job board */
export const PUBLIC_JOB_ROUTES = {
  list: "/jobs",
  detail: (slug: string) => `/jobs/${slug}`,
} as const;

/** Legacy bookmarks → current tracker paths */
export const LEGACY_TRACKER_REDIRECTS: ReadonlyArray<{
  from: string;
  to: string;
}> = [
  { from: "/add-job", to: TRACKER_ROUTES.add },
  { from: "/edit-job/:id", to: "/applications/edit/:id" },
  { from: "/my-jobs", to: TRACKER_ROUTES.list },
  { from: "/my-applications", to: TRACKER_ROUTES.list },
  { from: "/tracker", to: TRACKER_ROUTES.list },
  { from: "/tracker/add", to: TRACKER_ROUTES.add },
  { from: "/tracker/edit/:id", to: "/applications/edit/:id" },
  { from: "/applications/new", to: TRACKER_ROUTES.add },
];
