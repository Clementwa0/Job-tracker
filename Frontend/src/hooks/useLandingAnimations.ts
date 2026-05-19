import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface LandingAnimationProps {
  sectionRef?: React.RefObject<HTMLDivElement | null>;
  titleRef?: React.RefObject<HTMLElement | null>;
  subtitleRef?: React.RefObject<HTMLElement | null>;
}

const useLandingAnimations = ({
  sectionRef,
  titleRef,
  subtitleRef,
}: LandingAnimationProps) => {
  useEffect(() => {
    if (sectionRef?.current) {
      gsap.fromTo(
        sectionRef.current,
        {
          opacity: 0,
          y: 40,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }

    if (titleRef?.current) {
      gsap.fromTo(
        titleRef.current,
        {
          opacity: 0,
          y: 30,
        },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
        }
      );
    }

    if (subtitleRef?.current) {
      gsap.fromTo(
        subtitleRef.current,
        {
          opacity: 0,
          y: 20,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          delay: 0.2,
          ease: "power3.out",
        }
      );
    }

    const featureCards = gsap.utils.toArray<HTMLElement>(".feature-card");

    featureCards.forEach((card, i) => {
      gsap.fromTo(
        card,
        {
          opacity: 0,
          y: 20,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          delay: i * 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
            once: true,
          },
        }
      );
    });

    const stepItems = gsap.utils.toArray<HTMLElement>(".step-item");

    stepItems.forEach((item, i) => {
      gsap.fromTo(
        item,
        {
          opacity: 0,
          y: 25,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          delay: i * 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: item,
            start: "top 85%",
            once: true,
          },
        }
      );
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      gsap.killTweensOf("*");
    };
  }, [sectionRef, titleRef, subtitleRef]);
};

export default useLandingAnimations;