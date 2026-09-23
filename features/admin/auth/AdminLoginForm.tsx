"use client";

import { useCallback, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { AlertCircle, Eye, EyeOff, Loader2, Lock, Mail, Shield } from "lucide-react";
import { z } from "zod";
import { useAuth } from "@/features/auth/hooks/AuthContext";
import { loginSchema } from "@/lib/validation";
import { resolvePostLoginRedirect } from "@/lib/auth/redirects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type LoginFormData = z.infer<typeof loginSchema>;

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p
      id={id}
      role="alert"
      className="flex items-start gap-1.5 text-[12px] leading-4 text-red-600"
    >
      <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </p>
  );
}

export default function AdminLoginForm() {
  const [showPwd, setShowPwd] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const { loginAdmin } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirectParam = searchParams.get("redirect");
  const redirectTo =
    redirectParam && redirectParam.startsWith("/admin")
      ? redirectParam
      : undefined;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
    defaultValues: { email: "", password: "" },
  });

  const onSubmit: SubmitHandler<LoginFormData> = async (data) => {
    try {
      const user = await loginAdmin(data.email, data.password);
      toast.success("Signed in", {
        description: "Redirecting to the admin console…",
      });
      router.replace(resolvePostLoginRedirect(user.role || "admin", redirectTo));
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      toast.error("Authentication failed", {
        description: message || "Invalid credentials. Please try again.",
      });
    }
  };

  const handleKeyEvent = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (typeof e.getModifierState === "function") {
        setCapsLock(e.getModifierState("CapsLock"));
      }
    },
    []
  );

  return (
    <div className="w-full max-w-[400px]">
      <div className="rounded-lg border border-slate-200 bg-white p-7 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        {/* Brand row */}
        <div className="mb-7 flex items-center gap-2">
          <Shield
            className="h-4 w-4 text-slate-900"
            strokeWidth={2.25}
            aria-hidden="true"
          />
          <span className="text-[13px] font-semibold tracking-[-0.01em] text-slate-900">
            JobTrail
          </span>
          <span className="text-slate-300" aria-hidden="true">
            /
          </span>
          <span className="text-[13px] text-slate-500">Admin</span>
        </div>

        {/* Heading */}
        <div className="mb-6">
          <h1 className="text-[19px] font-semibold leading-tight tracking-[-0.015em] text-slate-900">
            Sign in
          </h1>
          <p className="mt-1 text-[13px] leading-5 text-slate-500">
            Authorized personnel only.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          {/* Email */}
          <div className="space-y-1.5">
            <Label
              htmlFor="email"
              className="text-[12.5px] font-medium text-slate-700"
            >
              Email
            </Label>

            <div className="relative">
              <Mail
                aria-hidden="true"
                className={cn(
                  "pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2",
                  errors.email ? "text-red-400" : "text-slate-400"
                )}
              />
              <Input
                id="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                autoFocus
                disabled={isSubmitting}
                placeholder="you@company.com"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
                className={cn(
                  "h-9 rounded-md border-slate-200 bg-white pl-9 text-[13px] transition-colors",
                  "placeholder:text-slate-400",
                  "focus-visible:border-slate-900 focus-visible:ring-1 focus-visible:ring-slate-900 focus-visible:ring-offset-0",
                  "disabled:cursor-not-allowed disabled:bg-slate-50",
                  errors.email &&
                    "border-red-400 focus-visible:border-red-500 focus-visible:ring-red-500"
                )}
                {...register("email")}
              />
            </div>

            <FieldError id="email-error" message={errors.email?.message} />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="password"
                className="text-[12.5px] font-medium text-slate-700"
              >
                Password
              </Label>
              <a
                href="/admin/forgot-password"
                className="text-[12px] text-slate-500 transition-colors hover:text-slate-900"
              >
                Forgot password
              </a>
            </div>

            <div className="relative">
              <Lock
                aria-hidden="true"
                className={cn(
                  "pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2",
                  errors.password ? "text-red-400" : "text-slate-400"
                )}
              />
              <Input
                id="password"
                type={showPwd ? "text" : "password"}
                autoComplete="current-password"
                disabled={isSubmitting}
                placeholder="Enter your password"
                aria-invalid={!!errors.password}
                aria-describedby={
                  errors.password
                    ? "password-error"
                    : capsLock
                      ? "password-caps"
                      : undefined
                }
                onKeyUp={handleKeyEvent}
                onKeyDown={handleKeyEvent}
                className={cn(
                  "h-9 rounded-md border-slate-200 bg-white pl-9 pr-9 text-[13px] transition-colors",
                  "placeholder:text-slate-400",
                  "focus-visible:border-slate-900 focus-visible:ring-1 focus-visible:ring-slate-900 focus-visible:ring-offset-0",
                  "disabled:cursor-not-allowed disabled:bg-slate-50",
                  errors.password &&
                    "border-red-400 focus-visible:border-red-500 focus-visible:ring-red-500"
                )}
                {...register("password", {
                  onBlur: () => setCapsLock(false),
                })}
              />

              <button
                type="button"
                onClick={() => setShowPwd((s) => !s)}
                aria-label={showPwd ? "Hide password" : "Show password"}
                aria-pressed={showPwd}
                tabIndex={-1}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 transition-colors hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/30"
              >
                {showPwd ? (
                  <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
                ) : (
                  <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                )}
              </button>
            </div>

            <FieldError id="password-error" message={errors.password?.message} />

            {capsLock && !errors.password && (
              <p
                id="password-caps"
                className="flex items-center gap-1.5 text-[12px] text-amber-700"
              >
                <AlertCircle className="h-3 w-3 shrink-0" aria-hidden="true" />
                Caps Lock is on
              </p>
            )}
          </div>

          {/* Remember */}
          <label className="flex cursor-pointer select-none items-center gap-2 pt-0.5">
            <input
              type="checkbox"
              name="remember"
              className="h-3.5 w-3.5 rounded border-slate-300 text-slate-900 focus:ring-1 focus:ring-slate-900 focus:ring-offset-0"
            />
            <span className="text-[12.5px] text-slate-600">
              Keep me signed in
            </span>
          </label>

          {/* Submit */}
          <Button
            type="submit"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
            className={cn(
              "mt-1 h-9 w-full rounded-md bg-slate-900 text-[13px] font-medium text-white",
              "transition-colors duration-150",
              "hover:bg-slate-800",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-60"
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2
                  className="mr-2 h-3.5 w-3.5 animate-spin"
                  aria-hidden="true"
                />
                Signing in…
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>

        {/* Quiet footer */}
        <div className="mt-6 border-t border-slate-100 pt-4">
          <p className="text-[11.5px] leading-4 text-slate-500">
            Access is logged. Contact your administrator if you need help.
          </p>
        </div>
      </div>
    </div>
  );
}