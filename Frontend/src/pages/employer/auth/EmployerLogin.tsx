import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import EmployerLoginForm from "@/features/employer/auth/EmployerLoginForm";

export default function EmployerLoginPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 bg-gradient-to-b from-background to-muted/30">
      <div className="absolute top-4 right-4">
        <Button asChild variant="outline" size="sm">
          <Link to="/"><ArrowLeft className="mr-2 h-4 w-4" /> Home</Link>
        </Button>
      </div>
      <EmployerLoginForm />
    </div>
  );
}
