import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { register as registerConstants } from "../constants";
import { registerSchema, type RegisterFormData } from "../lib/validation";
import { useAuth } from "../hooks/AuthContext";
import { Card, CardContent } from "./ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "./ui/button";

const Register = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register: authRegister } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
  });

  const onSubmit: SubmitHandler<RegisterFormData> = async (data: { name: string; email: string; password: string; }) => {
    setIsLoading(true);
    setError(null);
    try {
      await authRegister(data.name, data.email, data.password);
      navigate("/dashboard");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      {/* Left Panel - Brand Content */}
      <div className="hidden lg:flex lg:w-[45%] p-10 flex-col justify-between">
        <div className="space-y-12">
          <h1 className="text-4xl font-extrabold text-sky-800">JobTrail</h1>
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Track Your Applications - Stay Organized, Get Hired
            </h2>
            <p className="text-lg text-gray-700">
              Sign up to manage your job applications, interviews, and
              follow-ups all in one place.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {registerConstants.map((prop) => (
              <div key={prop.title} className="space-y-2">
                <div className="text-3xl">{prop.icon}</div>
                <h3 className="font-semibold text-gray-900">{prop.title}</h3>
                <p className="text-sm text-gray-700">{prop.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-sm text-gray-600 mt-8">
          Helping 20,000+ job seekers stay ahead
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="lg:w-[50%] flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[440px] rounded-2xl bg-white/30 dark:bg-gray-800/30 backdrop-blur-md shadow-xl border border-white/10 transition-all duration-300">
          <Card className="border-none bg-transparent shadow-none">
            <div className="text-center mb-6 px-6">
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                Create Your Job Trail Account
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Let's streamline your job hunt
              </p>
            </div>

            <CardContent className="px-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {error && (
                  <div className="p-3 text-sm text-red-700 bg-red-100 border border-red-300 rounded-md">
                    {error}
                  </div>
                )}

                {/* Name */}
                <div>
                  <Label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-white">
                    Full Name
                  </Label>
                  <Input
                    type="text"
                    {...register("name")}
                    autoComplete="name"
                    className={`mt-2 w-full px-4 py-3 rounded-xl border text-gray-900 dark:text-white bg-white/80 dark:bg-gray-800/70 backdrop-blur-sm shadow-sm focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all ${errors.name ? "border-red-500" : "border-gray-300 dark:border-gray-600"}`}
                    placeholder="Enter your full name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <Label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-white">
                    Email Address
                  </Label>
                  <Input
                    type="email"
                    {...register("email")}
                    autoComplete="email"
                    className={`mt-2 w-full px-4 py-3 rounded-xl border text-gray-900 dark:text-white bg-white/80 dark:bg-gray-800/70 backdrop-blur-sm shadow-sm focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all ${errors.email ? "border-red-500" : "border-gray-300 dark:border-gray-600"}`}
                    placeholder="Enter your email"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <Label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-white">
                    Password
                  </Label>
                  <Input
                    type="password"
                    {...register("password")}
                    autoComplete="new-password"
                    className={`mt-2 w-full px-4 py-3 rounded-xl border text-gray-900 dark:text-white bg-white/80 dark:bg-gray-800/70 backdrop-blur-sm shadow-sm focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all ${errors.password ? "border-red-500" : "border-gray-300 dark:border-gray-600"}`}
                    placeholder="Create a password"
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <Label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-white">
                    Confirm Password
                  </Label>
                  <Input
                    type="password"
                    {...register("confirmPassword")}
                    autoComplete="new-password"
                    className={`mt-2 w-full px-4 py-3 rounded-xl border text-gray-900 dark:text-white bg-white/80 dark:bg-gray-800/70 backdrop-blur-sm shadow-sm focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all ${errors.confirmPassword ? "border-red-500" : "border-gray-300 dark:border-gray-600"}`}
                    placeholder="Confirm your password"
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-6 text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-md hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {isLoading ? "Creating account..." : "Sign Up"}
                </Button>

                <p className="text-center text-sm text-gray-700 dark:text-gray-300">
                  Already tracking jobs?{" "}
                  <Link
                    to="/login"
                    className="font-medium text-sky-600 hover:text-sky-500 dark:text-sky-400 hover:underline transition"
                  >
                    Log in
                  </Link>
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Register;
