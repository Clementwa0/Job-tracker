import { RegisterFeatures, RegisterForm } from "@/components";

export function Register() {
  return (
    <div className="flex h-screen overflow-hidden">
      <RegisterFeatures />
      <RegisterForm />
    </div>
  );
}

export default Register;