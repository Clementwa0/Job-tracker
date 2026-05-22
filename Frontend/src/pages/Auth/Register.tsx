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
      <div className="absolute flex flex-end top-4 right-4 ">
        <Button asChild variant="default" size="sm" className="px-2 py-1 text-gray-100 mb-4">
          <Link to="/" className="flex items-center gap-1  ">
          <ArrowLeft className="w-3 h-3" />
            Back to Home
          </Link>
        </Button>
      </div>
      <div className="flex-1 flex items-center justify-center p-4 lg:p-6 bg-animated relative overflow-hidden">
        <RegisterForm />
      </div>
    </div>
  );
};

export default Register;