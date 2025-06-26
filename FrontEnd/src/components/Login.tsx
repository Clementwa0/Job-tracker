import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { login } from "../constants";
import { loginSchema, type LoginFormData } from "../lib/validation";
import { useAuth } from "../hooks/AuthContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";

export function Login({ className, ...props }: React.ComponentProps<"div">) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login: authLogin } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit: SubmitHandler<LoginFormData> = async (data) => {
    setIsLoading(true);
    setError(null);

    try {
      await authLogin(data.email, data.password);
      navigate("/dashboard");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Feature Section - Hidden on mobile */}
      <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-green-600 to-teal-700 p-12 text-white relative overflow-hidden">
        <div className="relative z-10 my-auto">
          {/* Logo */}
          <div className="mb-12">
            <svg className="w-12 h-12" viewBox="0 0 40 40" fill="none">
              <path
                d="M20 40c11.046 0 20-8.954 20-20S31.046 0 20 0 0 8.954 0 20s8.954 20 20 20z"
                fill="white"
              />
              <path d="M15 11l10 9-10 9V11z" fill="currentColor" />
            </svg>
          </div>

          <h1 className="text-4xl font-bold mb-6 leading-tight">
            Welcome Back to JobTrail
          </h1>
          <p className="text-lg text-white/80 mb-8 max-w-md">
            Your personal job application manager - organize, track, and
            succeed.
          </p>

          {/* Feature List */}
          <ul className="space-y-6">
            {login.map(({ icon, title, desc }) => (
              <li key={title} className="flex items-start space-x-3">
                <span className="text-2xl mt-1">{icon}</span>
                <div>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="text-white/70 text-sm">{desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg
            className="w-full h-full"
            viewBox="0 0 400 400"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern
                id="grid"
                x="0"
                y="0"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
      </div>

      {/* Right Login Section */}
      <div className="flex-1 flex items-center justify-center ">
        <div className="w-full max-w-[440px]  glassmorphism  p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-green-700 to-teal-600 bg-clip-text text-transparent">
                Welcome back
              </h2>
            </div>
            <div className={cn("flex flex-col gap-6", className)} {...props}>
              <Card className="border-none shadow-none">
                <CardHeader>
                  <CardTitle>Login to your account</CardTitle>
                  <CardDescription>
                    Enter your email below to login to your account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="flex flex-col gap-6">
                      {error && (
                        <div className="p-3 text-sm text-red-600 bg-red-50  rounded-md">
                          {error}
                        </div>
                      )}

                      <div className="grid gap-3">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="contact@gmail.com"
                          {...register("email")}
                          className={errors.email ? "border-red-500" : ""}
                        />
                        {errors.email && (
                          <p className="text-sm text-red-600">
                            {errors.email.message}
                          </p>
                        )}
                      </div>

                      <div className="grid gap-3">
                        <div className="flex items-center">
                          <Label htmlFor="password">Password</Label>
                          <a
                            href="#"
                            className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                          >
                            Forgot your password?
                          </a>
                        </div>
                        <Input
                          id="password"
                          type="password"
                          {...register("password")}
                          className={errors.password ? "border-red-500" : ""}
                        />
                        {errors.password && (
                          <p className="text-sm text-red-600">
                            {errors.password.message}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col gap-3">
                        <Button
                          type="submit"
                          className="w-full bg-green-900 text-white cursor-pointer"
                          disabled={isLoading}
                        >
                          {isLoading ? "Logging in..." : "Login"}
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full"
                          type="button"
                        >
                          Login with Google
                        </Button>
                      </div>
                    </div>
                    <p className="text-center text-sm text-gray-600 mt-4">
                      Don't have an account?{" "}
                      <Link
                        to="/register"
                        className="font-semibold text-green-600 hover:text-green-500"
                      >
                        Create one
                      </Link>
                    </p>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
