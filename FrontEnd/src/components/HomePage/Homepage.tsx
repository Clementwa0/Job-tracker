import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Linkedin, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { features, recentApplications, steps } from "@/constants";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Helmet } from "react-helmet";

gsap.registerPlugin(ScrollTrigger);

const Landing = () => {
  const heroRef = useRef<HTMLDivElement | null>(null);
  const featuresRef = useRef<HTMLDivElement | null>(null);
  const stepsRef = useRef<HTMLDivElement | null>(null);
  const ctaRef = useRef<HTMLDivElement | null>(null);

  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const subtitleRef = useRef<HTMLParagraphElement | null>(null);
  const typingTextRef = useRef<HTMLSpanElement | null>(null);
  const cursorRef = useRef<HTMLSpanElement | null>(null);
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const cleanupAnimations = () => {
      if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
      ScrollTrigger.getAll().forEach((t) => t.kill());
      gsap.killTweensOf("*");
    };

    const sections = [heroRef, featuresRef, stepsRef, ctaRef];
    sections.forEach((ref) => {
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
        },
      );
    });

    if (titleRef.current && subtitleRef.current) {
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 1, ease: "power3.out" },
      );

      gsap.fromTo(
        subtitleRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          delay: 0.3,
          ease: "power3.out",
        },
      );
    }

    const text = "Land More Interviews.";
    if (typingTextRef.current && cursorRef.current) {
      let i = 0;
      typingTextRef.current.textContent = "";
      typingIntervalRef.current = setInterval(() => {
        if (!typingTextRef.current) return;
        typingTextRef.current.textContent += text.charAt(i);
        i++;
        if (i >= text.length && typingIntervalRef.current) {
          clearInterval(typingIntervalRef.current);
        }
      }, 80);

      gsap.to(cursorRef.current, {
        opacity: 0,
        repeat: -1,
        yoyo: true,
        duration: 0.6,
        ease: "power1.inOut",
      });
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
        },
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
        },
      );
    });

    return cleanupAnimations;
  }, []);

  return (
    <>
    <Helmet>
      <title>JobTrail - Track Job Applications & Land More Interviews</title>
      <meta
        name="description"
        content="Organize your job search, track applications, and land more interviews with JobTrail." />
      <meta
        name="keywords"
        content="job tracker, job applications, career management, interview tracker, job hunt" />
    </Helmet>
    <div className="min-h-screen bg-gradient-to-b from-white via-white to-gray-50 overflow-hidden">
        {/* ================= HERO ================= */}
        <section ref={heroRef} className="pt-20 pb-24 px-4 sm:px-6 lg:px-8 relative">
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
                    |
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

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  asChild
                  size="lg"
                  className="w-full sm:w-auto gap-2 px-6 py-4 text-lg hover:scale-105 transition-transform"
                >
                  <Link to="/register" className="flex items-center justify-center gap-2">
                    Get Started <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto px-6 py-4 text-lg hover:border-blue-500 transition-colors"
                >
                  <Link to="/dashboard" className="flex justify-center">
                    View Dashboard
                  </Link>
                </Button>
              </div>
            </div>

            {/* DASHBOARD PREVIEW — HIDDEN ON MOBILE */}
            <div className="hidden lg:block absolute -right-18 top-6/4 -translate-y-1/2 w-[480px] z-10">
              <div className="relative">
                <div className="absolute -inset-6 bg-gradient-to-r from-blue-300 to-green-300 blur-3xl opacity-10 rounded-xl" />
                <div className="relative bg-white rounded-xl shadow-xl p-6 border border-slate-200 hover:shadow-2xl transition-shadow duration-300">
                  <div className="flex gap-2 pb-2 border-b">
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="ml-3 text-sm text-slate-500">
                      Job Applications Dashboard
                    </span>
                  </div>

                  <div>
                    <p className="text-sm font-semibold mb-2">
                      Recent Applications
                    </p>
                    <div className="space-y-2">
                      {recentApplications.map((job, i) => (
                        <div
                          key={i}
                          className="flex justify-between bg-slate-50 p-2 rounded-md hover:bg-indigo-50 transition-colors border border-transparent hover:border-indigo-200"
                        >
                          <div>
                            <p className="font-medium text-slate-800">
                              {job.position}
                            </p>
                            <span className="text-xs text-slate-600">
                              {job.company}
                            </span>
                          </div>
                          <span className="text-xs text-slate-600 font-medium">
                            {job.date}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= FEATURES ================= */}
        <section ref={featuresRef} className="py-16 sm:py-20 bg-white px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 sm:mb-14">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-slate-900">
                Everything You Need to Stay Organized
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto text-base sm:text-lg">
                Built to keep your job hunt clean, focused, and stress-free.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {features.map((f, i) => (
                <div
                  key={i}
                  className="feature-card p-6 rounded-xl border border-gray-200 hover:shadow-xl transition-all duration-300 bg-white hover:-translate-y-1 hover:border-blue-300"
                >
                  {f.icon && (
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg flex items-center justify-center mb-4">
                      <f.icon className="h-6 w-6 text-blue-600" />
                    </div>
                  )}
                  <h3 className="text-lg sm:text-xl font-semibold mb-3 text-slate-800">
                    {f.title}
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base leading-relaxed">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= STEPS ================= */}
        <section ref={stepsRef} className="py-16 sm:py-24 bg-gray-50 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto text-center">
            <div className="mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                How It Works
              </h2>
              <p className="text-gray-600 text-base sm:text-lg">
                Three simple steps to get hired faster
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 relative">
              {steps.map((step, i) => (
                <div key={i} className="step-item text-center relative">
                  {i < steps.length - 1 && (
                    <div className="hidden md:block absolute top-8 left-[60%] w-[100%] h-0.5 bg-gray-300" />
                  )}
                  <div className="w-16 h-16 mx-auto rounded-full bg-blue-900 text-white flex items-center justify-center text-2xl font-bold mb-6 shadow-lg relative z-10">
                    {i + 1}
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Call-to-action */}
            <div className="hidden lg:block mt-12 sm:mt-16 flex justify-center">
              <div className="inline-flex items-center justify-center w-full max-w-xl bg-gradient-to-r from-blue-500 to-green-500 rounded-full p-1 shadow-lg">
                <div className="bg-white w-full rounded-full flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 sm:py-3">
                  <span className="text-gray-800 font-semibold text-center sm:text-left text-sm sm:text-base">
                    Ready to transform your job search?
                  </span>
                  <Button asChild size="lg" className="w-full sm:w-auto">
                    <Link
                      to="/register"
                      className="flex items-center justify-center gap-2 whitespace-nowrap text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-full transition"
                    >
                      Start Free <ArrowRight className="h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= FOOTER ================= */}
        <footer
          ref={ctaRef}
          className="bg-gradient-to-b from-gray-900 to-black text-white py-10 sm:py-12 px-4"
        >
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 sm:mb-10">
              <div className="text-center md:text-left mb-6 md:mb-0">
                <Link
                  to="/"
                  className="text-xl sm:text-2xl font-bold hover:text-blue-300 transition-colors"
                >
                  JobTrail
                </Link>
                <p className="text-gray-300 mt-1 sm:mt-2 text-sm sm:text-base">
                  Your career journey, organized.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                <div className="flex gap-4 sm:gap-6">
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:scale-110 transition-transform"
                  >
                    <Linkedin className="h-5 w-5 sm:h-6 sm:w-6 text-gray-300 hover:text-blue-400" />
                  </a>
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:scale-110 transition-transform"
                  >
                    <Twitter className="h-5 w-5 sm:h-6 sm:w-6 text-gray-300 hover:text-blue-400" />
                  </a>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mt-2 sm:mt-0">
                  <Link
                    to="/login"
                    className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base"
                  >
                    Login
                  </Link>
                  <Button
                    asChild
                    variant="outline"
                    className="border-blue-400 text-blue-400 hover:bg-blue-500 hover:text-white text-sm sm:text-base w-full sm:w-auto"
                  >
                    <Link to="/register">Sign Up Free</Link>
                  </Button>
                </div>
              </div>
            </div>

            <div className="text-center text-gray-400 text-xs sm:text-sm pt-6 sm:pt-8 border-t border-gray-800">
              © {new Date().getFullYear()} JobTrail. All rights reserved.
            </div>
          </div>
        </footer>
      </div></>
  );
};

export default Landing;
