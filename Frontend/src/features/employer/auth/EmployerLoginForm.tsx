import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { z } from "zod";
import { useAuth } from "@/hooks/AuthContext";
import { loginSchema } from "@/lib/validation";
import { resolvePostLoginRedirect } from "@/lib/auth/redirects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type LoginFormData = z.infer<typeof loginSchema>;

export default function EmployerLoginForm() {
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const { loginEmployer } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const redirectParam = searchParams.get("redirect");
  const redirectTo =
    (redirectParam && redirectParam.startsWith("/employer") ? redirectParam : null) ||
    (location.state as { from?: string } | null)?.from;

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit: SubmitHandler<LoginFormData> = async (data) => {
    setLoading(true);
    try {
      const user = await loginEmployer(data.email, data.password);
      toast.success("Welcome back");
      navigate(resolvePostLoginRedirect(user.role || "employer", redirectTo), { replace: true });
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error("Sign-in failed", { description: message || "Check your credentials" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm rounded-2xl border border-border/60 bg-card/70 backdrop-blur-xl p-7 shadow-xl">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold tracking-tight">Employer sign in</h2>
        <p className="text-sm text-muted-foreground mt-1">Manage job postings and your company</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Work email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input id="email" type="email" autoComplete="email" className="pl-9" {...register("email")} />
          </div>
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link to="/employer/forgot-password" className="text-xs text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type={showPwd ? "text" : "password"}
              autoComplete="current-password"
              className="pl-9 pr-9"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPwd((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Signing in…</> : "Sign in"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          New employer?{" "}
          <Link to="/employer/register" className="font-medium text-primary hover:underline">
            Create account
          </Link>
        </p>
        <p className="text-center text-xs text-muted-foreground">
          Job seeker? <Link to="/login" className="text-primary hover:underline">User login</Link>
        </p>
      </form>
    </div>
  );
}
