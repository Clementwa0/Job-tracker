import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Star,  Zap, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { features, recentApplications, steps } from "@/constants";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import LOGO from "@/assets/logo.png";

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
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-lg border-b border-slate-100 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <a href="#home" className="flex items-center gap-2">
            <img 
              src={LOGO}
              alt="JobTrail Logo" 
              className="h-10" 
            />
            <span className="font-bold text-xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">JobTrail</span>
          </a>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#features" className="text-slate-600 hover:text-indigo-600 transition-colors font-medium">Features</a>
            <a href="#how-it-works" className="text-slate-600 hover:text-indigo-600 transition-colors font-medium">How it works</a>
            <a href="#testimonials" className="text-slate-600 hover:text-indigo-600 transition-colors font-medium">Testimonials</a>
            <Link to="/login">
              <Button variant="ghost" className="text-slate-700 hover:text-indigo-600 transition-colors">
                Login
              </Button>
            </Link>
            <Link to="/register">
              <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white transition-all hover:shadow-lg">
                Sign Up Free
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
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 transition-transform hover:scale-105">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section 
        id="home" 
        ref={heroRef}
        className="pt-32 pb-20 bg-gradient-to-br from-indigo-50 via-white to-white"
      >
        <div className="container mx-auto px-4 flex flex-col lg:flex-row gap-16 items-center">
          <div className="lg:w-1/2 space-y-6 hero-content">
            <div className="inline-flex items-center rounded-full bg-indigo-100 px-4 py-1.5 text-sm font-medium text-indigo-700 mb-4">
              <Zap className="w-4 h-4 mr-1" /> Streamline your job search
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-slate-900">
              Track every job opportunity in <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">one place</span>
            </h1>
            <p className="text-lg text-slate-600 max-w-lg">
              Ditch the spreadsheets. JobTrail helps you organize applications, interviews, and offers—all in one intuitive dashboard.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Link to="/register">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white transition-all hover:shadow-lg py-6 px-8 text-base"
                >
                  Get Started Free <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-slate-300 text-slate-800 hover:bg-slate-50 transition-all py-6 px-8 text-base"
                >
                  View Demo
                </Button>
              </Link>
            </div>
            <div className="flex items-center pt-4 gap-4 text-sm text-slate-500">
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1 text-indigo-500" /> 
                <span>5,000+ job seekers</span>
              </div>
              <div className="flex items-center">
                <Star className="w-4 h-4 mr-1 text-amber-500" fill="currentColor" /> 
                <span>4.8/5 rating</span>
              </div>
            </div>
          </div>
          <div className="lg:w-1/2 relative">
            <div className="dashboard-card bg-white rounded-2xl shadow-2xl p-6 border border-slate-100 overflow-hidden">
              <div className="absolute -top-10 -right-10 w-20 h-20 bg-purple-100 rounded-full"></div>
              <div className="absolute -bottom-8 -left-8 w-16 h-16 bg-indigo-100 rounded-full"></div>
              
              <div className="flex gap-2 pb-4 border-b border-slate-100 relative z-10">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <div className="w-3 h-3 bg-amber-400 rounded-full"></div>
                <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
                <span className="ml-3 text-sm font-medium text-slate-700">Job Applications Dashboard</span>
              </div>
              <div className="grid grid-cols-3 gap-4 my-6 relative z-10">
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 text-center p-5 rounded-xl transition-all hover:shadow-md">
                  <div className="text-3xl font-bold text-indigo-700">12</div>
                  <p className="text-sm text-slate-600 mt-1">Applied</p>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-amber-100 text-center p-5 rounded-xl transition-all hover:shadow-md">
                  <div className="text-3xl font-bold text-amber-700">5</div>
                  <p className="text-sm text-slate-600 mt-1">Interviews</p>
                </div>
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 text-center p-5 rounded-xl transition-all hover:shadow-md">
                  <div className="text-3xl font-bold text-emerald-700">2</div>
                  <p className="text-sm text-slate-600 mt-1">Offers</p>
                </div>
              </div>
              <div className="relative z-10">
                <p className="text-sm font-semibold mb-3 text-slate-800">Recent Applications</p>
                <div className="space-y-3">
                  {recentApplications.map((job, i) => (
                    <div 
                      key={i} 
                      className="flex justify-between items-center bg-slate-50 p-3 rounded-lg transition-all hover:bg-indigo-50 group"
                    >
                      <div>
                        <p className="font-medium text-slate-800 group-hover:text-indigo-700">{job.position}</p>
                        <span className="text-xs text-slate-500">{job.company}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-slate-200 text-slate-700 mr-2">{job.status}</span>
                        <span className="text-xs text-slate-500">{job.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="p-6">
              <div className="text-3xl md:text-4xl font-bold text-indigo-700 mb-2">95%</div>
              <p className="text-slate-600">Users feel more organized</p>
            </div>
            <div className="p-6">
              <div className="text-3xl md:text-4xl font-bold text-indigo-700 mb-2">42%</div>
              <p className="text-slate-600">Faster job search process</p>
            </div>
            <div className="p-6">
              <div className="text-3xl md:text-4xl font-bold text-indigo-700 mb-2">78%</div>
              <p className="text-slate-600">More interview callbacks</p>
            </div>
            <div className="p-6">
              <div className="text-3xl md:text-4xl font-bold text-indigo-700 mb-2">5,000+</div>
              <p className="text-slate-600">Active users</p>
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
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Everything you need for your job search
            </h2>
            <p className="text-lg text-slate-600">
              Stop toggling between spreadsheets, calendars, and email. JobTrail brings it all together in one beautiful interface.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map(({ id, icon: Icon, title, description }) => (
              <div 
                key={id} 
                className="feature-card bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 text-left group"
              >
                <div className="bg-gradient-to-br from-indigo-100 to-purple-100 w-14 h-14 flex items-center justify-center rounded-2xl mb-5 group-hover:scale-105 transition-transform">
                  <Icon className="w-7 h-7 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
                <p className="text-slate-600">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section 
        id="how-it-works" 
        ref={stepsRef}
        className="py-20 bg-gradient-to-br from-indigo-50 to-slate-50"
      >
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">How JobTrail works</h2>
            <p className="text-lg text-slate-600">Get started in minutes and take control of your job search</p>
          </div>
          <div className="space-y-12 max-w-4xl mx-auto relative">
            <div className="hidden md:block absolute top-0 left-1/2 -translate-x-1/2 h-full w-1 bg-gradient-to-b from-indigo-200 to-purple-200"></div>
            {steps.map(({ id, title, description }, index) => {
              const right = index % 2 !== 0;
              return (
                <div 
                  key={id} 
                  className={`step-item flex flex-col md:flex-row ${right ? "md:flex-row-reverse" : ""} items-center gap-8`}
                >
                  <div className="md:w-1/2">
                    <div className="bg-white p-7 rounded-2xl shadow-sm border border-slate-100 text-left transition-all hover:shadow-md">
                      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
                      <p className="text-slate-600">{description}</p>
                    </div>
                  </div>
                  <div className="md:w-1/2 flex justify-center relative">
                    <div className="w-14 h-14 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl flex items-center justify-center text-lg font-semibold shadow-lg z-10">
                      {id}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center md:hidden">
                      <div className="w-1 h-full bg-gradient-to-b from-indigo-200 to-purple-200"></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Loved by job seekers</h2>
            <p className="text-lg text-slate-600">See what our users have to say about their experience with JobTrail</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((item) => (
              <div key={item} className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <div className="flex items-center mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-5 h-5 text-amber-400" fill="currentColor" />
                  ))}
                </div>
                <p className="text-slate-700 mb-4">"JobTrail completely transformed my job search. I went from chaotic spreadsheets to an organized process that helped me land my dream job!"</p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold mr-3">
                    {item === 1 ? 'S' : item === 2 ? 'J' : 'A'}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{item === 1 ? 'Sarah M.' : item === 2 ? 'James L.' : 'Alex K.'}</p>
                    <p className="text-sm text-slate-500">{item === 1 ? 'Software Engineer' : item === 2 ? 'Marketing Manager' : 'Product Designer'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section 
        ref={ctaRef}
        className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-center"
      >
        <div className="container mx-auto px-4 cta-content">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to organize your job search?</h2>
          <p className="text-lg mb-8 max-w-xl mx-auto opacity-90">
            Join thousands of job seekers who have streamlined their job search process with JobTrail.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button 
                size="lg" 
                className="bg-white text-indigo-600 hover:bg-slate-100 transition-all hover:shadow-lg px-8 py-6 text-base font-medium"
              >
                Get Started Free
              </Button>
            </Link>
            <Link to="/login">
              <Button 
                size="lg" 
                variant="outline" 
                className="bg-transparent border-white text-white hover:bg-white/10 transition-all px-8 py-6 text-base font-medium"
              >
                Schedule a Demo
              </Button>
            </Link>
          </div>
          <div className="mt-8 text-sm opacity-80">
            <p>No credit card required • Free forever plan</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-16">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-5">
              <img 
                src={LOGO}
                alt="JobTrail Logo" 
                className="h-8" 
              />
              <span className="font-bold text-xl text-white">JobTrail</span>
            </div>
            <p className="text-slate-400 mb-4">Track your applications, ace your interviews, and land your dream job.</p>
            <div className="flex gap-4">
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-5 text-white text-lg">Product</h4>
            <ul className="space-y-3">
              <li><a href="#features" className="text-slate-400 hover:text-white transition-colors">Features</a></li>
              <li><a href="#how-it-works" className="text-slate-400 hover:text-white transition-colors">How it Works</a></li>
              <li><a href="#testimonials" className="text-slate-400 hover:text-white transition-colors">Testimonials</a></li>
              <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Pricing</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-5 text-white text-lg">Resources</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Guides</a></li>
              <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Support</a></li>
              <li><a href="#" className="text-slate-400 hover:text-white transition-colors">API</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-5 text-white text-lg">Company</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-slate-400 hover:text-white transition-colors">About</a></li>
              <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Contact</a></li>
              <li><Link to="/login" className="text-slate-400 hover:text-white transition-colors">Login</Link></li>
              <li><Link to="/register" className="text-slate-400 hover:text-white transition-colors">Sign Up</Link></li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-slate-500 mb-4 md:mb-0">
            © {new Date().getFullYear()} JobTrail. All rights reserved.
          </div>
          <div className="flex gap-6 text-sm text-slate-500">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;
