"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, LockKeyhole, ShieldCheck } from "lucide-react";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { employerAuthService } from "@/features/employer/auth/services/employerAuthService";
import { useGoogleAuth } from "@/lib/auth/useGoogleAuth";

const footerLinks = [
  { label: "Job seeker?", cta: "Sign in here", href: "/account" },
];

export default function EmployerLogin() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");

  const { handleCredential, error, isLoading } = useGoogleAuth({
    signIn: employerAuthService.googleSignIn,
    role: "employer",
    redirectTo,
  });

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4 py-10">
      {/* Decorative blurs */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-blue-400/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-purple-400/25 blur-3xl" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-pink-300/10 blur-3xl" />

      <div className="relative z-10 w-full max-w-[380px]">
        {/* Glow behind card */}
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-blue-500/20 via-indigo-500/10 to-purple-500/20 blur-lg" />

        <div className="relative rounded-2xl border border-white/60 bg-white/85 p-7 shadow-2xl shadow-indigo-500/15 backdrop-blur-2xl">
          <div className="flex justify-center">
            <Brand employer />
          </div>

          {/* Icon badge */}
          <div className="relative mx-auto mt-7 flex h-12 w-12 items-center justify-center">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 opacity-20 blur-md" />
            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/30">
              <ShieldCheck
                className="h-5.5 w-5.5 text-white"
                strokeWidth={2.2}
              />
            </div>
          </div>

          {/* Heading */}
          <div className="mt-5 text-center">
            <h1 className="text-[22px] font-semibold leading-tight tracking-[-0.02em] text-[#0a1a3d]">
              Hire with confidence.
            </h1>

            <p className="mx-auto mt-2 max-w-[290px] text-[13px] leading-5 text-slate-500">
              Manage roles, candidates and pipelines in one platform.
            </p>

            {/* Google sign-in */}
            <GoogleSignInButton
              onCredential={handleCredential}
              disabled={isLoading}
              ariaLabel="Continue with Google"
              className="mt-6 flex h-11 w-full cursor-pointer items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-[13px] font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-blue-500/40 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            >
              <GoogleMark />
              <span>
                {isLoading ? "Signing you in…" : "Continue with Google"}
              </span>
            </GoogleSignInButton>

            {error && (
              <p
                role="alert"
                className="mt-2.5 rounded-lg border border-red-100 bg-red-50/80 px-3 py-2 text-[11px] font-medium leading-relaxed text-red-600"
              >
                {error}
              </p>
            )}

            <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
              <LockKeyhole
                className="h-3 w-3 shrink-0 text-blue-600"
                strokeWidth={2.2}
              />
              <span>Secure sign-on with Google</span>
            </div>

            {/* Divider */}
            <div className="mt-6 flex items-center gap-3">
              <span className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                Looking for work?
              </span>
              <span className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
            </div>

            {/* Job seeker CTA */}
            <div className="mt-4">
              {footerLinks.map(({ label, cta, href }) => (
                <Link
                  key={href}
                  href={href}
                  className="group flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white/60 py-3 text-[12px] font-semibold text-[#172038] transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50/80 hover:text-blue-700 hover:shadow-md hover:shadow-blue-500/10"
                >
                  {label && (
                    <span className="font-normal text-slate-500">{label}</span>
                  )}
                  <span className="inline-flex items-center gap-0.5">
                    {cta}
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Trust line below card */}
        <p className="mt-5 text-center text-[10px] font-medium text-slate-400">
          Built for modern hiring teams
        </p>
      </div>
    </main>
  );
}

function Brand({ employer = false }: { employer?: boolean }) {
  return (
    <Link
      href="/"
      aria-label="JobTrail home"
      className="inline-flex items-center gap-2"
    >
     
      <img src="/logo.png" alt="jobtrail" width={40} height={40} />

      <span className="text-[20px] font-semibold leading-none tracking-[-0.03em] text-[#0a1a3d]">
        Job<span className="font-normal">Trail</span>
      </span>

      {employer && (
        <>
          <span className="mx-1 h-3.5 border-l border-slate-200" />
          <span className="text-[11px] font-medium text-[#1766d1]">
            for Employers
          </span>
        </>
      )}
    </Link>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" className="h-4 w-4 shrink-0" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.72 1.22 9.22 3.62l6.88-6.88C35.92 2.34 30.42 0 24 0 14.62 0 6.5 5.38 2.56 13.22l8.02 6.23C12.48 13.68 17.78 9.5 24 9.5Z"
      />
      <path
        fill="#4285F4"
        d="M46.9 24.55c0-1.64-.15-3.22-.42-4.73H24v8.95h12.85c-.55 2.95-2.21 5.45-4.71 7.13l7.63 5.92c4.46-4.11 7.13-10.17 7.13-17.27Z"
      />
      <path
        fill="#FBBC05"
        d="M10.58 28.55A14.4 14.4 0 0 1 9.78 24c0-1.58.27-3.12.8-4.55l-8.02-6.23A24.1 24.1 0 0 0 0 24c0 3.89.93 7.57 2.56 10.78l8.02-6.23Z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.42 0 11.82-2.12 15.76-5.78l-7.63-5.92c-2.12 1.42-4.83 2.25-8.13 2.25-6.22 0-11.52-4.2-13.42-9.87l-8.02 6.23C6.5 42.62 14.62 48 24 48Z"
      />
    </svg>
  );
}
