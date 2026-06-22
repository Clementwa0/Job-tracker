import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { authService } from "@/services/authService";
import { Button } from "@/components/ui/button";

export default function VerifyEmail() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const ran = useRef(false);
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (ran.current || !token) return;
    ran.current = true;

    (async () => {
      try {
        await authService.verifyEmail(token);
        setStatus("success");
        setMessage("Your email has been verified. You can sign in now.");
      } catch (err: unknown) {
        setStatus("error");
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          "Invalid or expired verification link.";
        setMessage(msg);
      }
    })();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-lg">
        {status === "loading" && (
          <>
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Verifying your email…</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle2 className="mx-auto h-10 w-10 text-green-500" />
            <h1 className="mt-4 text-xl font-semibold">Email verified</h1>
            <p className="mt-2 text-sm text-muted-foreground">{message}</p>
            <Button className="mt-6 w-full" onClick={() => navigate("/login", { replace: true })}>
              Go to sign in
            </Button>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="mx-auto h-10 w-10 text-destructive" />
            <h1 className="mt-4 text-xl font-semibold">Verification failed</h1>
            <p className="mt-2 text-sm text-muted-foreground">{message}</p>
            <div className="mt-6 flex flex-col gap-2">
              <Button asChild variant="outline">
                <Link to="/register">Create account</Link>
              </Button>
              <Button asChild>
                <Link to="/login">Sign in</Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
