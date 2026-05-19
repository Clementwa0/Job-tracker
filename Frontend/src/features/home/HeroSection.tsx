import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardPreview from "./DashboardPreview";
import TypingText from "./TypingText";

const HeroSection = () => {
  return (
    <section className="pt-20 pb-24 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-7xl mx-auto relative">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 text-green-600 text-sm font-medium mb-6">
          <CheckCircle2 className="h-4 w-4" />
          Trusted by 10,000+ job seekers
        </div>

        <div className="text-center max-w-3xl mx-auto relative z-20">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Track Every Application.
            <TypingText text="Land More Interviews." />
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Organize your job search, track applications, and get hired faster
            with JobTrail.
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/register" className="flex items-center gap-2">
                Get Started
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>

            <Button asChild variant="outline" size="lg">
              <Link to="/dashboard">View Dashboard</Link>
            </Button>
          </div>
        </div>

        <DashboardPreview />
      </div>
    </section>
  );
};

export default HeroSection;