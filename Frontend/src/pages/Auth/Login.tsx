import { LoginForm, LoginFeatures } from "@/components";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export function Login({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "relative min-h-screen flex flex-col lg:flex-row",
        className
      )}
      {...props}
    >
      {/* Left side */}
      <LoginFeatures />

      {/* Top-right button */}
      <div className="absolute top-4 right-4 z-10">
        <Button asChild size="sm">
          <Link to="/" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </Button>
      </div>

      {/* Right side */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}

export default Login;