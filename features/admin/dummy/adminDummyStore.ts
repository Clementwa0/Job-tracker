import { useSyncExternalStore } from "react";
import type {
  AdminApplication,
  AdminCompany,
  AdminJobPosting,
  AdminUser,
  AuditLogEntry,
} from "@/types/admin";
import type { PostingStatus } from "@/types/employer";
import {
  DUMMY_ADMIN_APPLICATIONS,
  DUMMY_ADMIN_AUDIT_LOG,
  DUMMY_ADMIN_COMPANIES,
  DUMMY_ADMIN_JOBS,
  DUMMY_ADMIN_USERS,
} from "@/features/admin/dummy/adminDummyData";

// ---------------------------------------------------------------------------
// In-memory store shared across every admin page. Presentational only - no
// persistence, no API calls. Every mutation appends an audit log entry so
// "Recent activity" reflects what actually happened this session.
// ---------------------------------------------------------------------------

interface AdminStoreState {
  users: AdminUser[];
  companies: AdminCompany[];
  jobs: AdminJobPosting[];
  applications: AdminApplication[];
  auditLog: AuditLogEntry[];
}

let state: AdminStoreState = {
  users: DUMMY_ADMIN_USERS,
  companies: DUMMY_ADMIN_COMPANIES,
  jobs: DUMMY_ADMIN_JOBS,
  applications: DUMMY_ADMIN_APPLICATIONS,
  auditLog: DUMMY_ADMIN_AUDIT_LOG,
};

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

let logCounter = state.auditLog.length;
function logAction(action: string, targetType: string, targetId: string) {
  logCounter += 1;
  const entry: AuditLogEntry = {
    id: `log_${logCounter}`,
    actorId: "u_admin_1",
    action,
    targetType,
    targetId,
    createdAt: new Date().toISOString(),
  };
  // Newest first - matches how AdminRecentActivity expects logs to be ordered.
  state = { ...state, auditLog: [entry, ...state.auditLog] };
}

// --- selectors ---------------------------------------------------------
export function useAdminUsers(): AdminUser[] {
  return useSyncExternalStore(subscribe, () => state.users, () => state.users);
}
export function useAdminCompanies(): AdminCompany[] {
  return useSyncExternalStore(subscribe, () => state.companies, () => state.companies);
}
export function useAdminJobs(): AdminJobPosting[] {
  return useSyncExternalStore(subscribe, () => state.jobs, () => state.jobs);
}
export function useAdminApplications(): AdminApplication[] {
  return useSyncExternalStore(subscribe, () => state.applications, () => state.applications);
}
export function useAdminAuditLog(): AuditLogEntry[] {
  return useSyncExternalStore(subscribe, () => state.auditLog, () => state.auditLog);
}

// --- mutations -----------------------------------------------------------
export function setUserStatus(id: string, status: AdminUser["accountStatus"]) {
  state = { ...state, users: state.users.map((u) => (u.id === id ? { ...u, accountStatus: status } : u)) };
  logAction(status === "suspended" ? "user.suspended" : "user.activated", "user", id);
  emit();
}

export function setUserRole(id: string, role: AdminUser["role"]) {
  state = { ...state, users: state.users.map((u) => (u.id === id ? { ...u, role } : u)) };
  logAction("user.role_changed", "user", id);
  emit();
}

export function setCompanyStatus(id: string, status: AdminCompany["status"]) {
  state = {
    ...state,
    companies: state.companies.map((c) => (c.id === id ? { ...c, status } : c)),
  };
  const action = status === "approved" ? "company.approved" : status === "suspended" ? "company.suspended" : "company.set_pending";
  logAction(action, "company", id);
  emit();
}

export function setJobStatus(id: string, status: PostingStatus) {
  state = {
    ...state,
    jobs: state.jobs.map((j) =>
      j.id === id
        ? { ...j, status, publishedAt: status === "published" ? new Date().toISOString() : j.publishedAt }
        : j,
    ),
  };
  const action =
    status === "published" ? "job.published" : status === "closed" ? "job.closed" : status === "draft" ? "job.rejected" : "job.set_pending";
  logAction(action, "job_posting", id);
  emit();
}

/** Restores the original dummy dataset - handy if a demo needs a reset. */
export function resetAdminDummyStore() {
  state = {
    users: DUMMY_ADMIN_USERS,
    companies: DUMMY_ADMIN_COMPANIES,
    jobs: DUMMY_ADMIN_JOBS,
    applications: DUMMY_ADMIN_APPLICATIONS,
    auditLog: DUMMY_ADMIN_AUDIT_LOG,
  };
  logCounter = DUMMY_ADMIN_AUDIT_LOG.length;
  emit();
}
