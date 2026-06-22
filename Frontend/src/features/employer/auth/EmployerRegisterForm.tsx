import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { useAuth } from "@/hooks/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const employerRegisterSchema = z
  .object({
    companyName: z.string().min(2, "Company name is required").max(200),
    email: z.string().min(1, "Email is required").email("Please enter a valid email"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain uppercase, lowercase, and a number",
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    industry: z.string().max(120).optional(),
    location: z.string().max(120).optional(),
    website: z.string().url("Enter a valid URL").optional().or(z.literal("")),
    description: z.string().max(2000).optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type EmployerRegisterFormData = z.infer<typeof employerRegisterSchema>;

export default function EmployerRegisterForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { registerEmployer } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmployerRegisterFormData>({
    resolver: zodResolver(employerRegisterSchema),
  });

  const onSubmit: SubmitHandler<EmployerRegisterFormData> = async (data) => {
    setLoading(true);
    setError(null);
    try {
      await registerEmployer({
        companyName: data.companyName,
        email: data.email,
        password: data.password,
        industry: data.industry,
        location: data.location,
        website: data.website || undefined,
        description: data.description,
      });
      navigate("/employer/dashboard", { replace: true });
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
      <div className="text-center mb-5">
        <h2 className="text-2xl font-bold">Employer registration</h2>
        <p className="text-sm text-muted-foreground mt-1">Post jobs on the public board</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="companyName">Company name *</Label>
          <Input id="companyName" {...register("companyName")} />
          {errors.companyName && <p className="text-xs text-destructive">{errors.companyName.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Work email *</Label>
          <Input id="email" type="email" {...register("email")} />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="industry">Industry</Label>
            <Input id="industry" {...register("industry")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" {...register("location")} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <Input id="website" placeholder="https://company.com" {...register("website")} />
          {errors.website && <p className="text-xs text-destructive">{errors.website.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Company description</Label>
          <Textarea id="description" rows={3} {...register("description")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password *</Label>
          <Input id="password" type="password" {...register("password")} />
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm password *</Label>
          <Input id="confirmPassword" type="password" {...register("confirmPassword")} />
          {errors.confirmPassword && (
            <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
          )}
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating account…</> : "Create employer account"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Already registered?{" "}
          <Link to="/employer/login" className="text-primary hover:underline">Sign in</Link>
        </p>
      </form>
    </div>
  );
}
