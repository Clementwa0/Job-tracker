import { useEffect, useRef, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { register as registerConstants } from "../constants";
import { registerSchema, type RegisterFormData } from "../lib/validation";
import { useAuth } from "../hooks/AuthContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
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

  const onSubmit: SubmitHandler<RegisterFormData> = async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      await authRegister(data.name, data.email, data.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (leftPanelRef.current) {
        gsap.fromTo(
          leftPanelRef.current.querySelector("h1"),
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
        );
        gsap.fromTo(
          leftPanelRef.current.querySelector("p"),
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.5, delay: 0.15, ease: "power3.out" }
        );
      }

      if (formRef.current) {
        gsap.fromTo(
          formRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.7, delay: 0.2, ease: "power3.out" }
        );
      }

      featureRefs.current.forEach((feature, index) => {
        if (feature) {
          gsap.fromTo(
            feature,
            { opacity: 0, x: -20 },
            { opacity: 1, x: 0, duration: 0.5, delay: 0.3 + index * 0.08, ease: "power3.out" }
          );
        }
      });
    });

    return () => ctx.revert();
  }, []);

  const getStrengthClass = () => {
    if (passwordStrength === 1) return "strength-weak";
    if (passwordStrength === 2) return "strength-fair";
    if (passwordStrength === 3) return "strength-good";
    if (passwordStrength === 4) return "strength-strong";
    return "bg-muted";
  };

  const getStrengthText = () => {
    if (passwordStrength === 1) return "Weak";
    if (passwordStrength === 2) return "Fair";
    if (passwordStrength === 3) return "Good";
    if (passwordStrength === 4) return "Strong";
    return "";
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left Panel */}
      <div
        ref={leftPanelRef}
        className="hidden lg:flex lg:w-[42%] flex-col justify-between bg-gradient-to-br from-teal-700 to-sky-600 p-8 xl:p-10"
      >
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl xl:text-4xl font-bold text-white tracking-tight">
              JobTrail
            </h1>
            <p className="text-white text-sm mt-1">
              Your career journey starts here
            </p>
          </div>

          <div className="space-y-1">
            <h2 className="text-xl xl:text-2xl font-semibold text-white leading-tight">
              Track Applications
              <br />
              Stay Organized, Get Hired
            </h2>
          </div>

          <div className="grid gap-3 pt-2">
            {registerConstants.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  ref={(el) => {
                    featureRefs.current[index] = el;
                  }}
                  className="flex items-center gap-3 glass-panel rounded-lg p-3"
                >
                  <div className="flex-shrink-0 w-9 h-9 rounded-md bg-primary-foreground/10 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-medium text-white text-sm">
                      {feature.title}
                    </h3>
                    <p className="text-xs text-white truncate">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <p className="text-xs text-white">
          Trusted by 20,000+ job seekers worldwide
        </p>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-4 lg:p-6 bg-animated relative overflow-hidden">
        {/* Floating blurred shapes */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-sky-400 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl pointer-events-none"></div>
        <div className="absolute top-40 left-40 w-72 h-72 bg-sky-400 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-400/20 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl pointer-events-none"></div>

        <div ref={formRef} className="w-full max-w-sm bg-white/5 backdrop-blur-md border border-gray-200 rounded-2xl p-6 shadow-lg relative z-10">
          <div className="text-center mb-5">
            <h2 className="text-2xl font-bold text-primary-foreground">Create Account</h2>
            <p className="text-primary-foreground text-sm mt-1">
              Join thousands managing their job search
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
            {error && (
              <div className="p-2.5 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                {error}
              </div>
            )}

            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-medium text-primary-foreground">
                Full Name
              </Label>
              <Input
                type="text"
                {...register("name")}
                autoComplete="name"
                className={`input-field ${errors.name ? "input-error" : ""} text-gray-900 transition-all duration-200 border border-gray-400 focus:ring-2 focus:ring-sky-400 focus:ring-offset-1`}
                placeholder="Enter your full name"
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium text-primary-foreground">
                Email Address
              </Label>
              <Input
                type="email"
                {...register("email")}
                autoComplete="email"
                className={`input-field ${errors.email ? "input-error" : ""} transition-all border text-gray-900 border-gray-400 duration-200 focus:ring-2 focus:ring-sky-400 focus:ring-offset-1`}
                placeholder="Enter your email"
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-medium text-primary-foreground">
                Password
              </Label>
              <Input
                type="password"
                {...register("password")}
                autoComplete="new-password"
                className={`input-field ${errors.password ? "input-error" : ""} transition-all text-gray-900 border border-gray-400 duration-200 focus:ring-2 focus:ring-sky-400 focus:ring-offset-1`}
                placeholder="Create a password"
              />
              {passwordValue && (
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-primary-foreground">
                      Strength: {getStrengthText()}
                    </span>
                  </div>
                  <div className="w-full bg-green-600 rounded-full h-1 overflow-hidden">
                    <div
                      className={`strength-bar ${getStrengthClass()}`}
                      style={{ width: `${(passwordStrength / 4) * 100}%` }}
                    />
                  </div>
                </div>
              )}
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-xs font-medium text-primary-foreground ">
                Confirm Password
              </Label>
              <Input
                type="password"
                {...register("confirmPassword")}
                autoComplete="new-password"
                className={`input-field ${errors.confirmPassword ? "input-error" : ""} transition-all text-gray-900 duration-200 border border-gray-400 focus:ring-2 focus:ring-sky-400 focus:ring-offset-1`}
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && (
                <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 text-sm font-semibold rounded-lg shadow-md hover:shadow-xl transition-all duration-300 mt-2"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating account...
                </span>
              ) : (
                "Sign Up"
              )}
            </Button>

            <p className="text-center text-sm text-primary-foreground pt-2">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-blue-500 hover:text-green-800 transition-colors"
              >
                Log in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
