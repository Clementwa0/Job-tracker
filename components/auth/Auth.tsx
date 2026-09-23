"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";
import { JourneyPanel, signupNodes } from "./JourneyPanel";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { authService } from "@/lib/auth/authService";
import { useGoogleAuth } from "@/lib/auth/useGoogleAuth";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

const journeySteps = [
  { n: 1, title: "Profile", desc: "Tell us about yourself" },
  { n: 2, title: "Skills", desc: "Add your skills and experience" },
  { n: 3, title: "Preferences", desc: "Set your career preferences" },
  { n: 4, title: "Career journey", desc: "Get personalized recommendations" },
];

export default function AuthPage() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");

  const { handleCredential, error, isLoading } = useGoogleAuth({
    signIn: authService.googleSignIn,
    role: "user",
    redirectTo,
  });

  return (
    <main className="relative grid min-h-screen overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50 lg:grid-cols-[1.1fr_1fr]">
      <div className="pointer-events-none absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-blue-400/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-purple-400/25 blur-3xl" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-pink-300/10 blur-3xl" />

      <JourneyPanel
        headingLines={["Your career.", "Thoughtfully mapped."]}
        subtext="JobTrail helps you achieve clarity, build the right skills, and reach your next milestone."
        steps={journeySteps}
        nodes={signupNodes}
        journeyTitle="Your journey starts here ✦"
      />

      <section className="relative z-10 flex items-center justify-center px-5 py-10">
        <div className="relative w-full max-w-[380px]">
          {/* Glow behind card */}
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-blue-500/20 via-indigo-500/10 to-purple-500/20 blur-lg" />

          <div className="relative rounded-2xl border border-white/60 bg-white/85 p-7 shadow-2xl shadow-indigo-500/15 backdrop-blur-2xl">
            {/* Brand */}
            <Brand />

            {/* Icon badge */}
            <div className="relative mx-auto mt-7 flex h-12 w-12 items-center justify-center">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 opacity-20 blur-md" />
              <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/30">
                <ShieldCheck className="h-5.5 w-5.5 text-white" strokeWidth={2.2} />
              </div>
            </div>

            {/* Heading */}
            <h1 className="mt-5 text-center text-[22px] font-semibold leading-tight tracking-[-0.02em] text-[#0a1a3d]">
              Welcome to JobTrail
            </h1>
            <p className="mx-auto mt-2 max-w-[280px] text-center text-[13px] leading-5 text-slate-500">
              Sign in or create your account in seconds.
            </p>

            {/* Google sign-in */}
            <div className="mt-6">
              <GoogleSignInButton
                onCredential={handleCredential}
                disabled={isLoading}
                ariaLabel="Continue with Google"
                className="group h-11 w-full justify-center gap-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-[13px] font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-blue-500/40 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                <GoogleIcon />
                <span>{isLoading ? "Connecting…" : "Continue with Google"}</span>
              </GoogleSignInButton>

              {error && (
                <p
                  role="alert"
                  className="mt-2.5 rounded-lg border border-red-100 bg-red-50/80 px-3 py-2 text-center text-[11px] font-medium text-red-600"
                >
                  {error}
                </p>
              )}

              <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
                <LockKeyhole className="h-3 w-3 shrink-0 text-blue-600" strokeWidth={2.2} />
                <span>Your data is protected and never shared.</span>
              </div>
            </div>

            {/* Divider */}
            <div className="mt-6 flex items-center gap-3">
              <span className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                Hiring instead?
              </span>
              <span className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
            </div>

            {/* Employer CTA */}
            <Link
              href="/employer/login"
              className="group mt-4 flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white/60 py-3 text-[12px] font-semibold text-[#172038] transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50/80 hover:text-blue-700 hover:shadow-md hover:shadow-blue-500/10"
            >
              Sign in as an employer
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </Link>

            {/* Footer */}
            <p className="mt-6 text-center text-[11px] leading-4 text-slate-500">
              By continuing you agree to our{" "}
              <Link
                href="/terms"
                className="font-semibold text-blue-600 transition hover:text-blue-700 hover:underline"
              >
                Terms
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="font-semibold text-blue-600 transition hover:text-blue-700 hover:underline"
              >
                Privacy Policy
              </Link>
            </p>
          </div>

          {/* Trust badge below card */}
          <div className="mt-5 flex items-center justify-center gap-1.5 text-[10px] font-medium text-slate-400">
            <Sparkles className="h-3 w-3" />
            Trusted by thousands of job seekers
          </div>
        </div>
      </section>
    </main>
  );
}

function Brand() {
  return (
    <Link href="/" className="inline-flex items-center justify-center gap-2.5">
      <span className="relative flex h-9 w-9 items-center justify-center">
        <span className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 opacity-30 blur-sm" />
        <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-lg font-bold text-white shadow-md shadow-blue-500/30">
          ⌁
        </span>
      </span>
      <b className="text-[22px] font-semibold tracking-[-0.03em] text-[#0a1a3d]">
        JobTrail
      </b>
    </Link>
  );
}