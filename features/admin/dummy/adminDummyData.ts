import type {
  AdminApplication,
  AdminCompany,
  AdminJobPosting,
  AdminUser,
  AuditLogEntry,
} from "@/types/admin";

// ---------------------------------------------------------------------------
// Dummy data — foundation only, mirrors the employer dashboard's approach.
// No API calls happen anywhere in this feature; everything here is seed data
// for an in-memory store (see adminDummyStore.ts) that the admin pages read
// from and mutate during the session.
// ---------------------------------------------------------------------------

export const DUMMY_ADMIN_USERS: AdminUser[] = [
  { id: "u_admin_1", name: "Wanjiru Kamau", email: "wanjiru@jobtrail.example.com", role: "admin", accountStatus: "active", emailVerified: true, createdAt: "2026-01-10T09:00:00Z", lastLoginAt: "2026-09-16T08:12:00Z" },
  { id: "u_admin_2", name: "Peter Otieno", email: "peter.o@jobtrail.example.com", role: "admin", accountStatus: "active", emailVerified: true, createdAt: "2026-02-14T09:00:00Z", lastLoginAt: "2026-09-14T11:40:00Z" },

  { id: "u_emp_1", name: "Amina Yusuf", email: "amina@nimbuslogistics.example.com", role: "employer", accountStatus: "active", emailVerified: true, createdAt: "2026-03-01T09:00:00Z", lastLoginAt: "2026-09-15T14:00:00Z" },
  { id: "u_emp_2", name: "David Mwangi", email: "david@brightpath.example.com", role: "employer", accountStatus: "active", emailVerified: true, createdAt: "2026-04-11T09:00:00Z", lastLoginAt: "2026-09-13T10:20:00Z" },
  { id: "u_emp_3", name: "Grace Njeri", email: "grace@cedarworks.example.com", role: "employer", accountStatus: "active", emailVerified: false, createdAt: "2026-06-02T09:00:00Z", lastLoginAt: "2026-09-10T09:00:00Z" },
  { id: "u_emp_4", name: "Samuel Kiptoo", email: "samuel@rivergate.example.com", role: "employer", accountStatus: "suspended", emailVerified: true, createdAt: "2026-05-19T09:00:00Z", lastLoginAt: "2026-08-30T09:00:00Z" },

  { id: "u_js_1", name: "Faith Mutua", email: "faith.mutua@example.com", role: "user", accountStatus: "active", emailVerified: true, createdAt: "2026-05-01T09:00:00Z", lastLoginAt: "2026-09-16T07:00:00Z" },
  { id: "u_js_2", name: "Brian Ochieng", email: "brian.o@example.com", role: "user", accountStatus: "active", emailVerified: true, createdAt: "2026-05-14T09:00:00Z", lastLoginAt: "2026-09-15T18:00:00Z" },
  { id: "u_js_3", name: "Linet Wambui", email: "linet.w@example.com", role: "user", accountStatus: "active", emailVerified: true, createdAt: "2026-06-20T09:00:00Z", lastLoginAt: "2026-09-12T12:00:00Z" },
  { id: "u_js_4", name: "Kevin Mutiso", email: "kevin.m@example.com", role: "user", accountStatus: "active", emailVerified: false, createdAt: "2026-07-02T09:00:00Z", lastLoginAt: "2026-09-09T09:00:00Z" },
  { id: "u_js_5", name: "Purity Chebet", email: "purity.c@example.com", role: "user", accountStatus: "suspended", emailVerified: true, createdAt: "2026-07-18T09:00:00Z", lastLoginAt: "2026-08-20T09:00:00Z" },
  { id: "u_js_6", name: "Dennis Karanja", email: "dennis.k@example.com", role: "user", accountStatus: "active", emailVerified: true, createdAt: "2026-08-05T09:00:00Z", lastLoginAt: "2026-09-16T06:30:00Z" },
];

export const DUMMY_ADMIN_COMPANIES: AdminCompany[] = [
  { id: "c_1", name: "Nimbus Logistics Inc.", slug: "nimbus-logistics", location: "Nairobi, Kenya", industry: "Transportation & Logistics", status: "approved", createdBy: "u_emp_1", createdAt: "2026-03-01T09:05:00Z" },
  { id: "c_2", name: "Brightpath Retail Group", slug: "brightpath-retail", location: "Mombasa, Kenya", industry: "Retail", status: "approved", createdBy: "u_emp_2", createdAt: "2026-04-11T09:05:00Z" },
  { id: "c_3", name: "Cedarworks Studio", slug: "cedarworks-studio", location: "Remote", industry: "Design & Creative", status: "pending", createdBy: "u_emp_3", createdAt: "2026-06-02T09:05:00Z" },
  { id: "c_4", name: "Rivergate Finance", slug: "rivergate-finance", location: "Kisumu, Kenya", industry: "Financial Services", status: "suspended", createdBy: "u_emp_4", createdAt: "2026-05-19T09:05:00Z" },
];

export const DUMMY_ADMIN_JOBS: AdminJobPosting[] = [
  { id: "j_1", title: "Senior Backend Engineer", slug: "senior-backend-engineer", companyId: "c_1", status: "published", location: "Nairobi, Kenya", jobType: "Full-time", workMode: "Hybrid", viewCount: 412, publishedAt: "2026-09-10T09:00:00Z", createdBy: "u_emp_1", createdAt: "2026-09-08T09:00:00Z", company: { id: "c_1", name: "Nimbus Logistics Inc.", slug: "nimbus-logistics" } },
  { id: "j_2", title: "Fleet Operations Coordinator", slug: "fleet-operations-coordinator", companyId: "c_1", status: "published", location: "Mombasa, Kenya", jobType: "Full-time", workMode: "On-site", viewCount: 356, publishedAt: "2026-09-05T09:00:00Z", createdBy: "u_emp_1", createdAt: "2026-09-03T09:00:00Z", company: { id: "c_1", name: "Nimbus Logistics Inc.", slug: "nimbus-logistics" } },
  { id: "j_3", title: "Store Manager", slug: "store-manager", companyId: "c_2", status: "published", location: "Mombasa, Kenya", jobType: "Full-time", workMode: "On-site", viewCount: 289, publishedAt: "2026-09-02T09:00:00Z", createdBy: "u_emp_2", createdAt: "2026-08-30T09:00:00Z", company: { id: "c_2", name: "Brightpath Retail Group", slug: "brightpath-retail" } },
  { id: "j_4", title: "Merchandising Analyst", slug: "merchandising-analyst", companyId: "c_2", status: "pending_review", location: "Mombasa, Kenya", jobType: "Full-time", workMode: "Hybrid", viewCount: 0, createdBy: "u_emp_2", createdAt: "2026-09-14T09:00:00Z", company: { id: "c_2", name: "Brightpath Retail Group", slug: "brightpath-retail" } },
  { id: "j_5", title: "Product Designer (Contract)", slug: "product-designer-contract", companyId: "c_3", status: "pending_review", location: "Remote", jobType: "Contract", workMode: "Remote", viewCount: 0, createdBy: "u_emp_3", createdAt: "2026-09-12T09:00:00Z", company: { id: "c_3", name: "Cedarworks Studio", slug: "cedarworks-studio" } },
  { id: "j_6", title: "Brand Illustrator", slug: "brand-illustrator", companyId: "c_3", status: "draft", location: "Remote", jobType: "Part-time", workMode: "Remote", viewCount: 0, createdBy: "u_emp_3", createdAt: "2026-09-13T09:00:00Z", company: { id: "c_3", name: "Cedarworks Studio", slug: "cedarworks-studio" } },
  { id: "j_7", title: "Credit Risk Analyst", slug: "credit-risk-analyst", companyId: "c_4", status: "closed", location: "Kisumu, Kenya", jobType: "Full-time", workMode: "On-site", viewCount: 198, publishedAt: "2026-07-20T09:00:00Z", createdBy: "u_emp_4", createdAt: "2026-07-18T09:00:00Z", company: { id: "c_4", name: "Rivergate Finance", slug: "rivergate-finance" } },
  { id: "j_8", title: "Customer Support Associate", slug: "customer-support-associate", companyId: "c_1", status: "draft", location: "Nairobi, Kenya", jobType: "Part-time", workMode: "On-site", viewCount: 0, createdBy: "u_emp_1", createdAt: "2026-09-13T09:00:00Z", company: { id: "c_1", name: "Nimbus Logistics Inc.", slug: "nimbus-logistics" } },
  { id: "j_9", title: "Warehouse Supervisor", slug: "warehouse-supervisor", companyId: "c_1", status: "published", location: "Kisumu, Kenya", jobType: "Full-time", workMode: "On-site", viewCount: 210, publishedAt: "2026-08-20T09:00:00Z", createdBy: "u_emp_1", createdAt: "2026-08-18T09:00:00Z", company: { id: "c_1", name: "Nimbus Logistics Inc.", slug: "nimbus-logistics" } },
  { id: "j_10", title: "Retail Cashier", slug: "retail-cashier", companyId: "c_2", status: "published", location: "Nairobi, Kenya", jobType: "Part-time", workMode: "On-site", viewCount: 134, publishedAt: "2026-08-28T09:00:00Z", createdBy: "u_emp_2", createdAt: "2026-08-25T09:00:00Z", company: { id: "c_2", name: "Brightpath Retail Group", slug: "brightpath-retail" } },
];

export const DUMMY_ADMIN_APPLICATIONS: AdminApplication[] = [
  { id: "a_1", jobId: "j_1", jobTitle: "Senior Backend Engineer", companyId: "c_1", companyName: "Nimbus Logistics Inc.", applicantId: "u_js_1", applicantName: "Faith Mutua", applicantEmail: "faith.mutua@example.com", status: "shortlisted", appliedAt: "2026-09-11T09:00:00Z" },
  { id: "a_2", jobId: "j_1", jobTitle: "Senior Backend Engineer", companyId: "c_1", companyName: "Nimbus Logistics Inc.", applicantId: "u_js_2", applicantName: "Brian Ochieng", applicantEmail: "brian.o@example.com", status: "under_review", appliedAt: "2026-09-12T09:00:00Z" },
  { id: "a_3", jobId: "j_2", jobTitle: "Fleet Operations Coordinator", companyId: "c_1", companyName: "Nimbus Logistics Inc.", applicantId: "u_js_3", applicantName: "Linet Wambui", applicantEmail: "linet.w@example.com", status: "submitted", appliedAt: "2026-09-06T09:00:00Z" },
  { id: "a_4", jobId: "j_3", jobTitle: "Store Manager", companyId: "c_2", companyName: "Brightpath Retail Group", applicantId: "u_js_4", applicantName: "Kevin Mutiso", applicantEmail: "kevin.m@example.com", status: "rejected", appliedAt: "2026-09-03T09:00:00Z" },
  { id: "a_5", jobId: "j_3", jobTitle: "Store Manager", companyId: "c_2", companyName: "Brightpath Retail Group", applicantId: "u_js_6", applicantName: "Dennis Karanja", applicantEmail: "dennis.k@example.com", status: "shortlisted", appliedAt: "2026-09-04T09:00:00Z" },
  { id: "a_6", jobId: "j_9", jobTitle: "Warehouse Supervisor", companyId: "c_1", companyName: "Nimbus Logistics Inc.", applicantId: "u_js_5", applicantName: "Purity Chebet", applicantEmail: "purity.c@example.com", status: "submitted", appliedAt: "2026-08-21T09:00:00Z" },
  { id: "a_7", jobId: "j_10", jobTitle: "Retail Cashier", companyId: "c_2", companyName: "Brightpath Retail Group", applicantId: "u_js_1", applicantName: "Faith Mutua", applicantEmail: "faith.mutua@example.com", status: "under_review", appliedAt: "2026-08-29T09:00:00Z" },
  { id: "a_8", jobId: "j_7", jobTitle: "Credit Risk Analyst", companyId: "c_4", companyName: "Rivergate Finance", applicantId: "u_js_2", applicantName: "Brian Ochieng", applicantEmail: "brian.o@example.com", status: "rejected", appliedAt: "2026-07-21T09:00:00Z" },
  { id: "a_9", jobId: "j_9", jobTitle: "Warehouse Supervisor", companyId: "c_1", companyName: "Nimbus Logistics Inc.", applicantId: "u_js_6", applicantName: "Dennis Karanja", applicantEmail: "dennis.k@example.com", status: "shortlisted", appliedAt: "2026-08-22T09:00:00Z" },
  { id: "a_10", jobId: "j_2", jobTitle: "Fleet Operations Coordinator", companyId: "c_1", companyName: "Nimbus Logistics Inc.", applicantId: "u_js_4", applicantName: "Kevin Mutiso", applicantEmail: "kevin.m@example.com", status: "submitted", appliedAt: "2026-09-07T09:00:00Z" },
];

export const DUMMY_ADMIN_AUDIT_LOG: AuditLogEntry[] = [
  { id: "log_1", actorId: "u_admin_1", action: "job.published", targetType: "job_posting", targetId: "j_9", createdAt: "2026-08-20T09:01:00Z" },
  { id: "log_2", actorId: "u_admin_1", action: "company.approved", targetType: "company", targetId: "c_1", createdAt: "2026-03-02T09:00:00Z" },
  { id: "log_3", actorId: "u_admin_2", action: "company.approved", targetType: "company", targetId: "c_2", createdAt: "2026-04-12T09:00:00Z" },
  { id: "log_4", actorId: "u_admin_1", action: "user.suspended", targetType: "user", targetId: "u_js_5", createdAt: "2026-08-21T10:00:00Z" },
  { id: "log_5", actorId: "u_admin_2", action: "job.closed", targetType: "job_posting", targetId: "j_7", createdAt: "2026-08-25T09:00:00Z" },
  { id: "log_6", actorId: "u_admin_1", action: "job.published", targetType: "job_posting", targetId: "j_10", createdAt: "2026-08-28T09:00:00Z" },
  { id: "log_7", actorId: "u_admin_2", action: "user.suspended", targetType: "user", targetId: "u_emp_4", createdAt: "2026-08-30T09:10:00Z" },
  { id: "log_8", actorId: "u_admin_1", action: "company.suspended", targetType: "company", targetId: "c_4", createdAt: "2026-08-30T09:12:00Z" },
  { id: "log_9", actorId: "u_admin_2", action: "job.published", targetType: "job_posting", targetId: "j_1", createdAt: "2026-09-10T09:00:00Z" },
  { id: "log_10", actorId: "u_admin_1", action: "job.published", targetType: "job_posting", targetId: "j_2", createdAt: "2026-09-05T09:00:00Z" },
];

/**
 * Which state the dummy admin dashboard resolves to — same knob as the
 * employer dashboard. "default" is what ships.
 */
export type DummyAdminPreview = "default" | "loading" | "error";
export const DUMMY_ADMIN_PREVIEW: DummyAdminPreview = "default";
export const DUMMY_ADMIN_DELAY_MS = 600;
