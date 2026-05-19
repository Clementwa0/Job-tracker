import { RegisterFeatures, RegisterForm } from "@/components";

const Register = () => {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left Panel */}
      <RegisterFeatures />

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-4 lg:p-6 bg-animated relative overflow-hidden">
        <RegisterForm />
      </div>
    </div>
  );
};

export default Register;