import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Linkedin, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { features, recentApplications, steps } from "@/constants";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const Landing = () => {
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const stepsRef = useRef(null);
  const previewRef = useRef(null);
  const ctaRef = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const sections = [
      { ref: heroRef, delay: 0 },
      { ref: featuresRef, delay: 0.1 },
      { ref: stepsRef, delay: 0.1 },
      { ref: previewRef, delay: 0.1 },
      { ref: ctaRef, delay: 0 },
    ];

    sections.forEach(({ ref, delay }) => {
      if (ref.current) {
        gsap.fromTo(
          ref.current,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            delay,
            scrollTrigger: {
              trigger: ref.current,
              start: "top 80%",
              end: "bottom 20%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }
    });

    const featureCards = document.querySelectorAll(".feature-card");
    featureCards.forEach((card, index) => {
      gsap.fromTo(
        card,
        { opacity: 0, x: -20 },
        {
          opacity: 1,
          x: 0,
          duration: 0.5,
          delay: index * 0.1,
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        }
      );
    });

    const stepItems = document.querySelectorAll(".step-item");
    stepItems.forEach((item, index) => {
      gsap.fromTo(
        item,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          delay: index * 0.15,
          scrollTrigger: {
            trigger: item,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        }
      );
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  const getStatusBadge = (status: string) => {
    const config: Record<string, string> = {
      Applied: "bg-blue-100 text-blue-800 border-blue-200",
      Interview: "bg-green-100 text-green-800 border-green-200",
      Offer: "bg-purple-100 text-purple-800 border-purple-200",
      Rejected: "bg-red-100 text-red-800 border-red-200",
      Default: "bg-gray-100 text-gray-800 border-gray-200"
    };
    
    return config[status] || config.Default;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <section ref={heroRef} className="pt-20 pb-16 md:pt-28 md:pb-24 px-4">
        <div className="max-w-7xl mx-auto h-auto">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Track Every Application.
              <span className="block text-green-500 mt-2">Land More Interviews.</span>
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              Organize your job search, track applications, and get hired faster with our intuitive job tracking platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button asChild size="lg" className="gap-2 px-8 py-6 text-lg">
                <Link to="/register">
                  Get Started
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="px-8 py-6 text-lg">
                <Link to="/dashboard">
                  View Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-16 bg-white px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Stay Organized
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to streamline your job search process
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="feature-card p-6 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 bg-white"
              >
                {feature.icon && (
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-blue-600" />
                  </div>
                )}
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section ref={stepsRef} className="py-16 bg-gray-50 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Get started in three simple steps
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <div key={index} className="step-item relative">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold mb-6">
                    {index + 1}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">
                    {step.description}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-3/4 w-full h-0.5 bg-blue-200"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Applications Preview */}
      <section ref={previewRef} className="py-16 bg-white px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Track Your Progress
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Keep all your applications organized in one place
            </p>
          </div>
          <div className="bg-gray-50 rounded-2xl p-6 md:p-8 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recentApplications.map((app, index) => (
                <div 
                  key={index} 
                  className="bg-white p-5 rounded-xl border border-gray-200 hover:shadow-md transition-shadow duration-300"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                        <h4 className="font-semibold text-gray-900">{app.position}</h4>
                        <p className="text-gray-600 text-sm">{app.company}</p>
                      </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusBadge(app.status)}`}>
                      {app.status}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Applied: {app.date}</span>
                    {app.lastUpdated && (
                      <span>Updated: {app.lastUpdated}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <p className="text-gray-600 mb-4">
                Join thousands of job seekers who found their dream job with JobTrail
              </p>
            </div>
          </div>
        </div>
      </section>

  
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <Link to="/" className="text-2xl font-bold text-white">
                JobTrail
              </Link>
              <p className="text-gray-400 mt-2">Your career journey, organized.</p>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex space-x-4">
                <a 
                  href="https://linkedin.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-6 w-6" />
                </a>
                <a 
                  href="https://twitter.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter className="h-6 w-6" />
                </a>
              </div>
              <div className="flex space-x-6">
                <Link 
                  to="/login" 
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm">
            <p>© {new Date().getFullYear()} JobTrail. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;