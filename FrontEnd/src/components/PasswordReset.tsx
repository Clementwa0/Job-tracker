import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail, CheckCircle2 } from "lucide-react";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Simple email validation
    if (!email) {
      setError("Please enter your email address");
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    
    // Simulate API call
    try {
      // In a real app, you would call your API here
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSuccess(true);
    } catch (err) {
      setError("Failed to send reset instructions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 ">
        <Card className="w-full max-w-md border-0 shadow-2xl overflow-hidden relative">
          <div 
            className="absolute inset-0 z-0"
            style={{
              backgroundImage: "url('/src/assets/bg.png')",
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
            }}
          />
          <div className="absolute inset-0 bg-gray-900 z-0"></div>
          
          <div className="relative z-10">
            <CardHeader className="space-y-1 pb-4">
              <div className="flex justify-center mb-2">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full border border-white/30">
                  <CheckCircle2 className="h-8 w-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-center text-white">
                Check Your Email
              </CardTitle>
              <p className="text-sm text-center text-white/80">
                We've sent password reset instructions to your email
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
                <p className="text-white text-sm text-center">
                  If you don't see the email, check your spam folder or 
                  <button 
                    onClick={() => setSuccess(false)}
                    className="text-white font-medium underline ml-1"
                  >
                    try again
                  </button>
                </p>
              </div>
              
              <div className="text-center">
                <Link 
                  to="/login"
                  className="inline-flex items-center text-sm text-white/90 hover:text-white transition-colors"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to login
                </Link>
              </div>
            </CardContent>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-400">
      <Card 
        className="w-full max-w-md border-0 shadow-2xl overflow-hidden relative"
        style={{
          backgroundImage: "url('/src/assets/bg.png')",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
        }}
      >
        {/* Dark overlay for better readability */}
        <div className="absolute inset-0 bg-gray-900 z-0"></div>
        
        <div className="relative z-10">
          <CardHeader className="space-y-1 pb-4">
            <div className="flex justify-center mb-2">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full border border-white/30">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-white"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center text-white">
              Forgot Password
            </CardTitle>
            <p className="text-sm text-center text-white/80">
              Enter your email to reset your password
            </p>
          </CardHeader>

          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-500/20 text-red-100 rounded-lg flex items-center text-sm border border-red-500/30 backdrop-blur-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">
                  Email Address
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-white/70" />
                  </div>
                  <Input
                    id="email"
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/70 focus:ring-white/30 focus:border-white/30"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full py-3 text-base bg-white text-blue-900 hover:bg-white/90 transition-all shadow-lg"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </span>
                ) : (
                  "Send Reset Instructions"
                )}
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t border-white/20 text-center">
              <Link 
                to="/login"
                className="inline-flex items-center text-sm text-white/90 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to login
              </Link>
            </div>
          </CardContent>
        </div>
      </Card>
    </div>
  );
};

export default ForgotPassword;