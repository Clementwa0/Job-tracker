import { useEffect } from "react";
import gsap from "gsap";

export function useRegisterAnimation(
  leftRef: React.RefObject<HTMLDivElement | null>,
  formRef: React.RefObject<HTMLDivElement | null>,
  featuresRef: React.MutableRefObject<(HTMLDivElement | null)[]>
) {
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (leftRef.current) {
        gsap.fromTo(
          leftRef.current.querySelector("h1"),
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
        );

        gsap.fromTo(
          leftRef.current.querySelector("p"),
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.5, delay: 0.15, ease: "power3.out" }
        );
      }

      if (formRef.current) {
        gsap.fromTo(
          formRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.7, delay: 0.2, ease: "power3.out" }
        );
      }

      featuresRef.current.forEach((el, i) => {
        if (el) {
          gsap.fromTo(
            el,
            { opacity: 0, x: -20 },
            {
              opacity: 1,
              x: 0,
              duration: 0.5,
              delay: 0.3 + i * 0.08,
              ease: "power3.out",
            }
          );
        }
      });
    });

    return () => ctx.revert();
  }, [leftRef, formRef, featuresRef]);
}