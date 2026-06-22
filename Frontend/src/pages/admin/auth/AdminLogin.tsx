import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import AdminLoginForm from "@/features/admin/auth/AdminLoginForm";

export default function AdminLoginPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 bg-gradient-to-b from-slate-950 to-slate-900">
      <div className="absolute top-4 right-4">
        <Button asChild variant="outline" size="sm">
          <Link to="/"><ArrowLeft className="mr-2 h-4 w-4" /> Home</Link>
        </Button>
      </div>
      <AdminLoginForm />
    </div>
  );
}
