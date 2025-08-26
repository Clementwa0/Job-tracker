import { useEffect, useRef } from "react";
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
import gsap from "gsap";

const Register = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const { register: authRegister } = useAuth();
  const navigate = useNavigate();

  const leftPanelRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const featureRefs = useRef<(HTMLDivElement | null)[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
  });

  const passwordValue = watch("password", "");

  // Calculate password strength
  useEffect(() => {
    if (!passwordValue) {
      setPasswordStrength(0);
      return;
    }

    let strength = 0;
    if (passwordValue.length >= 8) strength += 1;
    if (/[A-Z]/.test(passwordValue)) strength += 1;
    if (/[0-9]/.test(passwordValue)) strength += 1;
    if (/[^A-Za-z0-9]/.test(passwordValue)) strength += 1;

    setPasswordStrength(strength);
  }, [passwordValue]);

  const onSubmit: SubmitHandler<RegisterFormData> = async (data: {
    name: string;
    email: string;
    password: string;
  }) => {
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

  // GSAP Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Left panel animations
      if (leftPanelRef.current) {
        gsap.fromTo(
          leftPanelRef.current.querySelectorAll("*"),
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.15,
            delay: 0.3,
            ease: "power3.out",
          }
        );
      }

      // Form animations
      if (formRef.current) {
        gsap.fromTo(
          formRef.current,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            delay: 0.5,
            ease: "elastic.out(1, 0.8)",
          }
        );
      }

      // Feature animations
      featureRefs.current.forEach((feature, index) => {
        if (feature) {
          gsap.fromTo(
            feature,
            { opacity: 0, y: 30 },
            {
              opacity: 1,
              y: 0,
              duration: 0.7,
              delay: 0.6 + index * 0.1,
              ease: "back.out(1.2)",
            }
          );
        }
      });
    });

    return () => ctx.revert(); // Cleanup animations
  }, []);

  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) return "bg-gray-300";
    if (passwordStrength === 1) return "bg-red-500";
    if (passwordStrength === 2) return "bg-yellow-500";
    if (passwordStrength === 3) return "bg-blue-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength === 0) return "";
    if (passwordStrength === 1) return "Weak";
    if (passwordStrength === 2) return "Fair";
    if (passwordStrength === 3) return "Good";
    return "Strong";
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen dark:bg-gray-900">
      {/* Left Panel - Brand Content */}
      <div
        ref={leftPanelRef}
        className="hidden lg:flex lg:w-[45%] p-5 flex-col justify-between bg-gradient-to-br from-teal-700 to-sky-600"
      >
        <div className="space-y-12">
          <div>
            <h1 className="text-5xl font-extrabold text-sky-300 mb-1">JobTrail</h1>
            <p className="text-sky-200 text-lg">Your career journey starts here</p>
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-white">
              Track Your Applications - Stay Organized, Get Hired
            </h2>
            <p className="text-lg text-teal-100">
              Sign up to manage your job applications, interviews, and
              follow-ups all in one place.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 mt-2">
            {registerConstants.map((prop, index) => (
              <div
                key={prop.title}
                ref={(el) => {
                  featureRefs.current[index] = el;
                }}
                className="flex items-start space-x-4 p-3 rounded-lg bg-white/10 backdrop-blur-sm transition-all hover:bg-white/20"
              >
                <div className="text-2xl text-sky-300 mt-1">{prop.icon}</div>
                <div>
                  <h3 className="font-semibold text-gray-100 text-lg">{prop.title}</h3>
                  <p className="text-sm text-teal-100 mt-1">{prop.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-sm text-teal-200 mt-8">
          <p>Helping 20,000+ job seekers stay ahead in their career journey</p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-4 lg:p-8">
        <div
          ref={formRef}
          className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          <Card className="border-none bg-transparent shadow-none">
            <div className="text-center mb-2 px-8 pt-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Create Your Account
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Join thousands managing their job search efficiently
              </p>
            </div>

            <CardContent className="px-8 pb-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {error && (
                  <div className="p-3 text-sm text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-300 border border-red-300 dark:border-red-700 rounded-md">
                    {error}
                  </div>
                )}

                {/* Name */}
                <div>
                  <Label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Full Name
                  </Label>
                  <Input
                    type="text"
                    {...register("name")}
                    autoComplete="name"
                    className={`w-full px-4 py-3 rounded-lg border text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all ${
                      errors.name
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                    placeholder="Enter your full name"
                  />
                  {errors.name && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <Label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Email Address
                  </Label>
                  <Input
                    type="email"
                    {...register("email")}
                    autoComplete="email"
                    className={`w-full px-4 py-3 rounded-lg border text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all ${
                      errors.email
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                    placeholder="Enter your email"
                  />
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <Label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Password
                  </Label>
                  <Input
                    type="password"
                    {...register("password")}
                    autoComplete="new-password"
                    className={`w-full px-4 py-3 rounded-lg border text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all ${
                      errors.password
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                    placeholder="Create a password"
                  />
                  
                  {passwordValue && (
                    <div className="mt-2">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Password strength: {getPasswordStrengthText()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getPasswordStrengthColor()}`}
                          style={{ width: `${(passwordStrength / 4) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  {errors.password && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <Label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Confirm Password
                  </Label>
                  <Input
                    type="password"
                    {...register("confirmPassword")}
                    autoComplete="new-password"
                    className={`w-full px-4 py-3 rounded-lg border text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all ${
                      errors.confirmPassword
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                    placeholder="Confirm your password"
                  />
                  {errors.confirmPassword && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-6 text-base font-semibold text-white bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-sky-500/20 transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 mt-2"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating account...
                    </span>
                  ) : (
                    "Sign Up"
                  )}
                </Button>

                <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
                  Already have an account?{" "}
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