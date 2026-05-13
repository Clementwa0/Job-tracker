import { LoginFeatures, LoginForm } from "@/components";

export function Login() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row dark:bg-gray-900">
      <LoginFeatures />
      <LoginForm />
    </div>
  );
}

export default Login;