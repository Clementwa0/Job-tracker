// Auth pages

export { SkeletonHeader, SkeletonStatCard, SkeletonCard, SkeletonJobCard, SkeletonTableRow, SkeletonFilterBar, SkeletonChart, SkeletonText } from "./shared/skeletons/SkeletonPrimitives";


export { default as Login } from "@/pages/auth/Login"
export { default as Register } from "@/pages/auth/Register"
export { default as ForgotPassword } from "@/pages/auth/ForgotPassword"
export { default as ResetPassword } from "@/pages/auth/ResetPassword"

// Dashboard pages
export { default as Dashboard } from "@/pages/dashboard/Dashboard"

// Jobs pages
export { default as Jobs } from "@/pages/jobs/Jobs"
export { default as AddJob } from "@/pages/jobs/AddJob"
export { default as EditJob } from "@/pages/jobs/EditJob"

// Profile pages
export { default as Profile } from "@/pages/profile/Profile"

// Settings pages
export { default as Settings } from "@/pages/settings/Settings"

// Shared components
export { default as LoadingSpinner } from "@/pages/shared/LoadingSpinner"
export { default as PageSkeleton } from "@/pages/shared/PageSkeleton"
export { default as NotFound } from "@/pages/NotFound"
export { default as Terms } from "@/pages/Terms"

// Skeleton components
export {AnalyticsPageSkeleton } from "@/pages/shared/skeletons/AnalyticsPageSkeleton"
export {DashboardPageSkeleton } from "@/pages/shared/skeletons/DashboardPageSkeleton"
export {JobsPageSkeleton } from "@/pages/shared/skeletons/JobsPageSkeleton"
