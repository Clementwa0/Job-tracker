import { useRef } from "react";
import HeroSection from "./HeroSection";
import FeaturesSection from "./FeaturesSection";
import StepsSection from "./StepsSection";
import FooterSection from "./FooterSection";
import { useLandingAnimations } from "./useLandingAnimations";
import { recentApplications } from "@/constants";

export default function Landing() {
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const stepsRef = useRef(null);
  const ctaRef = useRef(null);

  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const typingTextRef = useRef(null);
  const cursorRef = useRef(null);

  useLandingAnimations({
    heroRef,
    featuresRef,
    stepsRef,
    ctaRef,
    titleRef,
    subtitleRef,
    typingTextRef,
    cursorRef,
  });

  return (
    <>
      <HeroSection
        heroRef={heroRef}
        titleRef={titleRef}
        subtitleRef={subtitleRef}
        typingTextRef={typingTextRef}
        cursorRef={cursorRef}
        recentApplications={recentApplications}
      />

      <FeaturesSection featuresRef={featuresRef} />
      <StepsSection stepsRef={stepsRef} />
      <FooterSection ctaRef={ctaRef} />
    </>
  );
}