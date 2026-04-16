import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export const useLandingAnimations = (refs: any) => {
  useEffect(() => {
    const cleanupAnimations = () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
      gsap.killTweensOf("*");
    };

    const sections = [
      refs.heroRef,
      refs.featuresRef,
      refs.stepsRef,
      refs.ctaRef,
    ];

    sections.forEach((ref: any) => {
      if (!ref.current) return;

      gsap.fromTo(
        ref.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          scrollTrigger: {
            trigger: ref.current,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        }
      );
    });

    if (refs.titleRef.current && refs.subtitleRef.current) {
      gsap.fromTo(
        refs.titleRef.current,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 1, ease: "power3.out" }
      );

      gsap.fromTo(
        refs.subtitleRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          delay: 0.3,
          ease: "power3.out",
        }
      );
    }

    const featureCards = gsap.utils.toArray<HTMLElement>(".feature-card");
    featureCards.forEach((card, i) => {
      gsap.fromTo(
        card,
        { opacity: 0, x: -20 },
        {
          opacity: 1,
          x: 0,
          delay: i * 0.1,
          duration: 0.5,
          scrollTrigger: { trigger: card, start: "top 85%", once: true },
        }
      );
    });

    const stepItems = gsap.utils.toArray<HTMLElement>(".step-item");
    stepItems.forEach((item, i) => {
      gsap.fromTo(
        item,
        { opacity: 0, y: 25 },
        {
          opacity: 1,
          y: 0,
          delay: i * 0.15,
          duration: 0.6,
          scrollTrigger: { trigger: item, start: "top 85%", once: true },
        }
      );
    });

    return cleanupAnimations;
  }, [refs]);
};