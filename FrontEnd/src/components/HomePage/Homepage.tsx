import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { features, recentApplications, steps } from "@/constants";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

const Homepage = () => {
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const stepsRef = useRef(null);
  const ctaRef = useRef(null);

  useEffect(() => {
    // Hero section animations
    gsap.fromTo(
      ".hero-content > *",
      { y: 30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top 80%",
        },
      }
    );

    // Dashboard card animation
    gsap.fromTo(
      ".dashboard-card",
      { y: 50, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        delay: 0.4,
        ease: "elastic.out(1, 0.8)",
        scrollTrigger: {
          trigger: ".dashboard-card",
          start: "top 85%",
        },
      }
    );

    // Features animation
    gsap.fromTo(
      ".feature-card",
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.7,
        stagger: 0.15,
        ease: "back.out(1.2)",
        scrollTrigger: {
          trigger: featuresRef.current,
          start: "top 85%",
        },
      }
    );

    // Steps animation
    gsap.fromTo(
      ".step-item",
      { x: (i) => (i % 2 === 0 ? -100 : 100), opacity: 0 },
      {
        x: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.3,
        ease: "power3.out",
        scrollTrigger: {
          trigger: stepsRef.current,
          start: "top 90%",
        },
      }
    );

    // CTA animation
    gsap.fromTo(
      ".cta-content > *",
      { y: 30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ctaRef.current,
          start: "top 85%",
        },
      }
    );

    // Logo animation
    gsap.fromTo(
      "header img",
      { scale: 0.8, opacity: 0 },
      {
        scale: 1,
        opacity: 1,
        duration: 0.8,
        ease: "elastic.out(1.2, 0.8)",
      }
    );
  }, []);

  return (
    <div className="bg-white text-slate-800 overflow-x-hidden">
      <header className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-lg border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <a href="#home">
            <img 
              src="/src/assets/logo.png" 
              alt="JobTrail Logo" 
              className="h-13" 
            />
          </a>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <a href="#features" className="text-slate-600 hover:text-indigo-600 transition-colors">Features</a>
            <a href="#how-it-works" className="text-slate-600 hover:text-indigo-600 transition-colors">How it works</a>
            <Link to="/register">
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white transition-transform hover:scale-105">
                Sign Up
              </Button>
            </Link>
          </nav>
          <div className="md:hidden flex gap-2">
            <Link to="/login">
              <Button variant="outline" size="sm" className="transition-transform hover:scale-105">
                Login
              </Button>
            </Link>
            <Link to="/register">
              <Button size="sm" className="transition-transform hover:scale-105">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section 
        id="home" 
        ref={heroRef}
        className="pt-32 pb-24 bg-gradient-to-b from-indigo-50 via-white to-white"
      >
        <div className="container mx-auto px-4 flex flex-col lg:flex-row gap-16 items-center">
          <div className="lg:w-1/2 space-y-6 hero-content">
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-slate-900">
              Take charge of your career - track every opportunity with ease
            </h1>
            <p className="text-lg text-slate-600">
              Stop using spreadsheets. JobTrail helps you track applications, interviews, and offers—all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register">
                <Button 
                  size="lg" 
                  className="bg-indigo-600 hover:bg-indigo-700 transition-transform hover:scale-105"
                >
                  Get Started Free <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link to="/login">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="text-gray-900 transition-transform hover:scale-105"
                >
                  Login
                </Button>
              </Link>
            </div>
          </div>
          <div className="lg:w-1/2 relative">
            <div className="dashboard-card bg-white rounded-xl shadow-xl p-6 border border-slate-200">
              <div className="flex gap-2 pb-2 border-b">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="ml-3 text-sm text-slate-500">Job Applications Dashboard</span>
              </div>
              <div className="grid grid-cols-3 gap-4 my-4">
                <div className="bg-indigo-100 text-center p-4 rounded-md transition-transform hover:scale-105">
                  <div className="text-3xl font-bold text-indigo-700">12</div>
                  <p className="text-sm">Applied</p>
                </div>
                <div className="bg-amber-100 text-center p-4 rounded-md transition-transform hover:scale-105">
                  <div className="text-3xl font-bold text-amber-700">5</div>
                  <p className="text-sm">Interviews</p>
                </div>
                <div className="bg-green-100 text-center p-4 rounded-md transition-transform hover:scale-105">
                  <div className="text-3xl font-bold text-green-700">2</div>
                  <p className="text-sm">Offers</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold mb-2">Recent Applications</p>
                <div className="space-y-2">
                  {recentApplications.map((job, i) => (
                    <div 
                      key={i} 
                      className="flex justify-between bg-slate-50 p-2 rounded-md transition-all hover:bg-indigo-50"
                    >
                      <div>
                        <p className="font-medium">{job.position}</p>
                        <span className="text-xs text-slate-500">{job.company}</span>
                      </div>
                      <span className="text-xs text-slate-500">{job.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section 
        id="features" 
        ref={featuresRef}
        className="py-20 bg-white"
      >
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Everything you need to manage your job search
          </h2>
          <p className="text-lg text-slate-600 mb-12">
            Stop toggling between spreadsheets, calendars, and email. JobTrail brings it all together.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map(({ id, icon: Icon, title, description }) => (
              <div 
                key={id} 
                className="feature-card bg-slate-50 hover:bg-slate-100 transition p-6 rounded-xl shadow-sm text-left"
              >
                <div className="bg-indigo-100 w-12 h-12 flex items-center justify-center rounded-full mb-4">
                  <Icon className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-bold">{title}</h3>
                <p className="text-sm text-slate-600 mt-2">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section 
        id="how-it-works" 
        ref={stepsRef}
        className="py-20 bg-slate-50"
      >
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">How JobTrail works</h2>
          <p className="text-lg text-slate-600 mb-12">Get started in minutes and take control of your job search</p>
          <div className="space-y-12 max-w-4xl mx-auto relative">
            <div className="hidden md:block absolute top-0 left-1/2 -translate-x-1/2 h-full w-px bg-slate-300"></div>
            {steps.map(({ id, title, description }, index) => {
              const right = index % 2 !== 0;
              return (
                <div 
                  key={id} 
                  className={`step-item flex flex-col md:flex-row ${right ? "md:flex-row-reverse" : ""} items-center gap-6`}
                >
                  <div className="md:w-1/2">
                    <div className="bg-white p-6 rounded-lg shadow-sm border text-left transition-transform hover:scale-[1.02]">
                      <h3 className="text-xl font-bold">{title}</h3>
                      <p className="text-slate-600 mt-2">{description}</p>
                    </div>
                  </div>
                  <div className="md:w-1/2 flex justify-center">
                    <div className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center text-lg font-semibold shadow-md">
                      {id}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section 
        ref={ctaRef}
        className="py-20 bg-[#013220] text-white text-center"
      >
        <div className="container mx-auto px-4 cta-content">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to organize your job search?</h2>
          <p className="text-lg mb-8 max-w-xl mx-auto">
            Join thousands of job seekers who have streamlined their job search process with JobTrail.
          </p>
          <Link to="/register">
            <Button 
              size="lg" 
              variant="secondary" 
              className="bg-white text-indigo-600 hover:bg-slate-100 transition-transform hover:scale-105"
            >
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h4 className="text-xl font-bold mb-4 text-white">JobTrail</h4>
            <p>Track your applications, ace your interviews, and land your dream job.</p>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-white">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Login</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Sign Up</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-white">Legal</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="text-center text-sm mt-8 border-t border-slate-800 pt-6">
          © {new Date().getFullYear()} JobTrail. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Homepage;