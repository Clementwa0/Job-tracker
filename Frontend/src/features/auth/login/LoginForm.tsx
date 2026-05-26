import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, Mail, Lock } from "lucide-react";

import { useAuth } from "@/hooks/AuthContext";
import { loginSchema, type LoginFormData } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [remember, setRemember] = useState(true);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = (location.state as any)?.from || "/dashboard";

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit: SubmitHandler<LoginFormData> = async (data) => {
    setLoading(true);
    try {
      await login(data.email, data.password);
      if (!remember) sessionStorage.setItem("session_only", "1");
      toast.success("Welcome back");
      navigate(redirectTo, { replace: true });
    } catch (err: any) {
      toast.error("Sign-in failed", { description: err?.response?.data?.message || "Check your credentials" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="w-full max-w-sm rounded-2xl border border-border/60 bg-card/70 backdrop-blur-xl p-7 shadow-xl"
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold tracking-tight">Welcome back</h2>
        <p className="text-sm text-muted-foreground mt-1">Sign in to continue tracking jobs</p>
      </div>

      {/* OAuth */}
      <div className="grid grid-cols-2 gap-2 mb-5">
        <a href={`${API}/auth/google`} className="flex items-center justify-center gap-2 h-10 rounded-lg border border-border bg-background hover:bg-muted/60 text-sm font-medium transition-colors">
          <svg viewBox="0 0 24 24" className="h-4 w-4"><path fill="currentColor" d="M21.35 11.1h-9.18v2.92h5.27c-.23 1.4-1.65 4.12-5.27 4.12-3.18 0-5.77-2.62-5.77-5.85s2.59-5.85 5.77-5.85c1.81 0 3.02.77 3.72 1.43l2.53-2.45C16.83 3.83 14.7 3 12.18 3 6.99 3 2.8 7.18 2.8 12.4s4.19 9.4 9.38 9.4c5.42 0 9-3.81 9-9.18 0-.62-.07-1.1-.18-1.52z"/></svg>
          Google
        </a>
        <a href={`${API}/auth/github`} className="flex items-center justify-center gap-2 h-10 rounded-lg border border-border bg-background hover:bg-muted/60 text-sm font-medium transition-colors">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M12 .5C5.65.5.5 5.65.5 12.02c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2.17c-3.2.7-3.88-1.36-3.88-1.36-.53-1.34-1.29-1.7-1.29-1.7-1.06-.72.08-.71.08-.71 1.17.08 1.79 1.2 1.79 1.2 1.04 1.78 2.73 1.27 3.4.97.1-.75.41-1.27.74-1.56-2.55-.29-5.24-1.27-5.24-5.66 0-1.25.45-2.27 1.18-3.07-.12-.29-.51-1.47.11-3.06 0 0 .97-.31 3.18 1.17a11 11 0 0 1 5.79 0c2.2-1.48 3.17-1.17 3.17-1.17.63 1.59.23 2.77.11 3.06.74.8 1.18 1.82 1.18 3.07 0 4.4-2.69 5.36-5.25 5.65.42.36.8 1.07.8 2.16v3.21c0 .31.21.68.8.56A11.52 11.52 0 0 0 23.5 12.02C23.5 5.65 18.35.5 12 .5z"/></svg>
          GitHub
        </a>
      </div>

      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
        <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">or</span></div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input id="email" type="email" placeholder="you@example.com" autoComplete="email" {...register("email")} className="pl-9" />
          </div>
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link to="/forget-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input id="password" type={showPwd ? "text" : "password"} autoComplete="current-password"
              placeholder="••••••••" {...register("password")} className="pl-9 pr-9" />
            <button type="button" onClick={() => setShowPwd((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>

        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 rounded" />
          Remember me
        </label>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Signing in…</> : "Sign in"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          New here? <Link to="/register" className="font-medium text-primary hover:underline">Create an account</Link>
        </p>
      </form>
    </div>
  );
}
