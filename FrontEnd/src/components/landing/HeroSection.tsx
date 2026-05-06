import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardPreview from "./DashboardPreview";

export default function HeroSection({
  heroRef,
  titleRef,
  subtitleRef,
  typingTextRef,
  cursorRef,
  recentApplications,
}: any) {
  return (
    <section
      ref={heroRef}
      className="pt-20 pb-24 px-4 sm:px-6 lg:px-8 relative"
    >
      <div className="max-w-7xl mx-auto relative">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 text-green-600 text-sm font-medium mb-6">
          <CheckCircle2 className="h-4 w-4" />
          Trusted by 10,000+ job seekers
        </div>

        <div className="text-center max-w-3xl mx-auto relative z-20">
          <h1
            ref={titleRef}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight"
          >
            Track Every Application.
            <span className="block text-green-500 mt-2 text-2xl sm:text-3xl md:text-4xl">
              <span ref={typingTextRef}></span>
              <span ref={cursorRef} className="ml-1 inline-block">
                Start Your Job Hunt with JobTrail
              </span>
            </span>
          </h1>

          <p
            ref={subtitleRef}
            className="text-base sm:text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto"
          >
            Organize your job search, track applications, and get hired faster
            with JobTrail.
          </p>

          <div className="flex flex-cols-2 sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="w-fit sm: gap-2 px-6 py-4 text-lg hover:scale-105 transition-transform"
            >
              <Link to="/register" className="flex items-center gap-2">
                Get Started <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-fit sm:px-6 py-4 text-lg hover:border-blue-500 transition-colors"
            >
              <Link to="/dashboard" className="flex justify-center">
                View Dashboard
              </Link>
            </Button>
          </div>
        </div>

        <DashboardPreview recentApplications={recentApplications} />
      </div>
    </section>
  );
}