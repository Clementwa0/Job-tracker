import { RegisterFeatures, RegisterForm } from "@/components";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Register = () => {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left Panel */}
      <RegisterFeatures />

      {/* Right Panel */}
        <div className="absolute top-4 right-4 z-10">
        <Button asChild size="sm">
          <Link to="/" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </Button>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-4 lg:p-6 relative overflow-hidden">
        <RegisterForm />
      </div>
    </div>
  );
};

export default Register;