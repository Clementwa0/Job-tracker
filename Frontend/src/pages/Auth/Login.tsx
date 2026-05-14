import { LoginForm ,LoginFeatures } from "@/components";
import { cn } from "@/lib/utils";

export function Login({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("min-h-screen flex flex-col lg:flex-row", className)}
      {...props}
    >
      {/* Left side */}
      <LoginFeatures />

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
