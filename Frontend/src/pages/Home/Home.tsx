import { HeroSection, FeaturesSection } from "@/components";
import StepsSection from "@/features/home/StepsSection";
import { Footer } from "react-day-picker";
import { Helmet } from "react-helmet";

const Landing = () => {
  return (
    <>
      <Helmet>
        <title>
          JobTrail - Track Job Applications & Land More Interviews
        </title>

        <meta
          name="description"
          content="Organize your job search, track applications, and land more interviews with JobTrail."
        />

        <meta
          name="keywords"
          content="job tracker, job applications, interview tracker"
        />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-white via-white to-gray-50 overflow-hidden">
        <HeroSection />
        <FeaturesSection />
        <StepsSection />
        <Footer />
      </div>
    </>
  );
};

export default Landing;