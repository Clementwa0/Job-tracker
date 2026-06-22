import { Link } from "react-router-dom";
import EmployerForgotPasswordForm from "@/features/employer/auth/EmployerForgotPasswordForm";

export default function EmployerForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-b from-background to-muted/30">
      <EmployerForgotPasswordForm />
      <p className="sr-only">
        <Link to="/employer/login">Back to login</Link>
      </p>
    </div>
  );
}
