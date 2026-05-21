import {
  CTASection,
  FeaturesSection,
  Footer,
  HeroSection,
  Nav,
} from "@/components";
import StepsSection from "@/features/home/StepsSection";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900">
      <Nav />
      <main>
        <HeroSection />
        <section id="features">
          <FeaturesSection />
        </section>
        <section id="how">
          <StepsSection />
        </section>
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}