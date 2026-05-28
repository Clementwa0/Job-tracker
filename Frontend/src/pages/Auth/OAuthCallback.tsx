import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/AuthContext";

export default function OAuthCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const token = params.get("token");
    const error = params.get("error");

    if (error || !token) {
      toast.error("Social sign-in failed", { description: error || "Missing token" });
      navigate("/login", { replace: true });
      return;
    }

    (async () => {
      try {
        await loginWithToken(token);
        toast.success("Signed in");
        navigate("/dashboard", { replace: true });
      } catch (e: any) {
        toast.error("Sign-in failed", { description: e?.response?.data?.message || "Could not complete sign-in" });
        navigate("/login", { replace: true });
      }
    })();
  }, [params, loginWithToken, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex items-center gap-3 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        Completing sign-in…
      </div>
    </div>
  );
}
