import { useEffect, useRef } from "react";
import { register as registerConstants } from "@/constants";
import gsap from "gsap";

export function RegisterFeatures() {
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const featureRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (leftPanelRef.current) {
        gsap.fromTo(
          leftPanelRef.current.querySelector("h1"),
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
        );
        gsap.fromTo(
          leftPanelRef.current.querySelector("p"),
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.5, delay: 0.15, ease: "power3.out" }
        );
      }

      featureRefs.current.forEach((feature, index) => {
        if (feature) {
          gsap.fromTo(
            feature,
            { opacity: 0, x: -20 },
            {
              opacity: 1,
              x: 0,
              duration: 0.5,
              delay: 0.3 + index * 0.08,
              ease: "power3.out",
            }
          );
        }
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={leftPanelRef}
      className="hidden lg:flex lg:w-[42%] flex-col justify-between bg-gradient-to-br from-teal-700 to-sky-600 p-8 xl:p-10"
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl xl:text-4xl font-bold text-white tracking-tight">
            JobTrail
          </h1>
          <p className="text-white/80 text-sm mt-1">
            Your career journey starts here
          </p>
        </div>

        <div className="space-y-1">
          <h2 className="text-xl xl:text-2xl font-semibold text-white leading-tight">
            Track Applications
            <br />
            Stay Organized, Get Hired
          </h2>
        </div>

        <div className="grid gap-3 pt-2">
          {registerConstants.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                ref={(el) => {
                  featureRefs.current[index] = el;
                }}
                className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-3 
                  border border-white/20 hover:bg-white/20 transition-all duration-300
                  hover:shadow-lg hover:scale-[1.02] cursor-default"
              >
                <div className="flex-shrink-0 w-9 h-9 rounded-md bg-white/20 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-medium text-white text-sm">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-white/70 truncate">
                    {feature.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-xs text-white/60">
        Trusted by 20,000+ job seekers worldwide
      </p>
    </div>
  );
}