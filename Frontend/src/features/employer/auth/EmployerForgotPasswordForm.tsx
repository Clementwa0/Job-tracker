import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { employerAuthService } from "@/features/employer/services/employerAuthService";
import { getApiErrorMessage } from "@/lib/apiError";

export default function EmployerForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email) return setError("Please enter your email");
    setLoading(true);
    try {
      await employerAuthService.forgotPassword(email);
      setSuccess(true);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-7 text-center shadow-xl">
        <CheckCircle2 className="mx-auto h-10 w-10 text-primary" />
        <h2 className="mt-4 text-xl font-semibold">Check your email</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          If an employer account exists for {email}, we sent reset instructions.
        </p>
        <Button asChild className="mt-6" variant="outline">
          <Link to="/employer/login">Back to sign in</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-7 shadow-xl">
      <Button asChild variant="ghost" size="sm" className="-ml-2 mb-4">
        <Link to="/employer/login"><ArrowLeft className="mr-1 h-4 w-4" /> Back</Link>
      </Button>
      <h2 className="text-xl font-semibold">Reset employer password</h2>
      <p className="mt-1 text-sm text-muted-foreground">We&apos;ll email you a secure reset link.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Work email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              className="pl-9"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Sending…" : "Send reset link"}
        </Button>
      </form>
    </div>
  );
}
