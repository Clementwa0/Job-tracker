import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

import { useAuth } from "@/hooks/AuthContext";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import RegisterFeatures from "@/components/auth/RegisterFeatures";
import { usePasswordStrength } from "@/hooks/usePasswordStrength";
import { useRegisterAnimation } from "@/hooks/useRegisterAnimation";
import { registerSchema } from "@/lib/validation/auth.schema";
import type { RegisterFormData } from "@/lib/validation/auth.types";

const Register = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register: authRegister } = useAuth();
  const navigate = useNavigate();

  const leftRef = useRef<HTMLDivElement>(null);
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

  const password = watch("password", "");
  const strength = usePasswordStrength(password);

  useRegisterAnimation(leftRef, formRef, featureRefs);

  const onSubmit = async (data: RegisterFormData) => {
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

  return (
    <div className="flex h-screen overflow-hidden">
      {/* LEFT */}
      <div
        ref={leftRef}
        className="hidden lg:flex lg:w-[42%] flex-col justify-between bg-gradient-to-br from-teal-700 to-sky-600 p-10"
      >
        <div>
          <h1 className="text-4xl font-bold text-white">JobTrail</h1>
          <p className="text-white/80">Your career journey starts here</p>

          <RegisterFeatures featureRefs={featureRefs} />
        </div>

        <p className="text-white text-xs">
          Trusted by 20,000+ users
        </p>
      </div>

      {/* RIGHT */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div ref={formRef} className="w-full max-w-sm">
          <h2 className="text-2xl font-bold mb-4">Create Account</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <div>
              <Label>Name</Label>
              <Input {...register("name")} />
            </div>

            <div>
              <Label>Email</Label>
              <Input {...register("email")} />
            </div>

            <div>
              <Label>Password</Label>
              <Input type="password" {...register("password")} />
              <p className="text-xs mt-1">Strength: {strength}/4</p>
            </div>

            <div>
              <Label>Confirm Password</Label>
              <Input type="password" {...register("confirmPassword")} />
            </div>

            <Button disabled={isLoading} className="w-full">
              {isLoading ? (
                <Loader2 className="animate-spin w-4 h-4" />
              ) : (
                "Sign Up"
              )}
            </Button>

            <p className="text-center text-sm">
              Already have account? <Link to="/login">Login</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;