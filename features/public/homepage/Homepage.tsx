import { SectionWrapper } from "@/components/shared/public/layout";
import { HeroSection, LandingPreview, AboutPage } from "./components";

export const metadata = {
  title: "JobTrail | Your Career Has a Path",
  description:
    "Discover the right opportunities, track your applications, and plan your next career move with clarity.",
};

export default function Home() {
  return (
    <SectionWrapper>
      {/* Homepage Hero */}
      <section id="hero" aria-label="Hero">
        <HeroSection />
      </section>

      {/* Homepage Preview (Logos, Impact, Jobs, Dashboard) */}
      <section id="preview" aria-label="Landing preview">
        <LandingPreview />
      </section>

    </SectionWrapper>
  );
}