import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { features, recentApplications, steps } from "@/constants";

const Homepage = () => {
  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 min-h-screen">
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-200/60 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Link to="/">
              <img
                src="/assets/logo.png"
                alt="JobTrail Logo"
                className="h-12 w-auto hover:scale-105 transition-transform duration-200"
              />
            </Link>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-slate-600 hover:text-blue-600 transition-colors font-medium relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-blue-600 after:transition-all hover:after:w-full"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-slate-600 hover:text-blue-600 transition-colors font-medium relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-blue-600 after:transition-all hover:after:w-full"
            >
              How it works
            </a>
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 border-0">
              <Link to="/register" className="text-white">
                Sign Up
              </Link>
            </Button>
          </div>
          <div className="md:hidden flex items-center gap-3">
            <Link to="/login">
              <Button variant="outline" className="border-slate-300 hover:bg-slate-50">
                Login
              </Button>
            </Link>
            <Link to="/register">
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-24 bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/40">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2 space-y-8">
              <h1 className="text-5xl md:text-xl lg:text-xl font-bold text-slate-900 leading-tight">
                Take charge of your
                <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  career
                </span>
                track every opportunity with ease
              </h1>
              <p className="text-xl text-slate-600 leading-relaxed max-w-2xl">
                Stop using spreadsheets. JobTrail helps you track applications, interviews, and offers in one place with intelligent insights and automation.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register">
                  <Button className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 group px-8 py-3 text-lg">
                    Get Started Free <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" className="w-full sm:w-auto border-slate-300 hover:bg-slate-50 px-8 py-3 text-lg">
                    Login
                  </Button>
                </Link>
              </div>
            </div>
            <div className="lg:w-1/2 relative">
              <div className="bg-white/70 backdrop-blur-sm shadow-2xl rounded-2xl p-8 border-0 relative overflow-hidden">
                <div className="space-y-6">
                  <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <div className="ml-3 text-sm text-slate-500 font-medium">Job Applications Dashboard</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 p-4 text-center border border-blue-200 hover:shadow-md transition-shadow">
                      <div className="text-3xl font-bold text-blue-600">12</div>
                      <div className="text-sm text-blue-700 font-medium">Applied</div>
                    </div>
                    <div className="rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 p-4 text-center border border-amber-200 hover:shadow-md transition-shadow">
                      <div className="text-3xl font-bold text-amber-600">5</div>
                      <div className="text-sm text-amber-700 font-medium">Interviews</div>
                    </div>
                    <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 text-center border border-emerald-200 hover:shadow-md transition-shadow">
                      <div className="text-3xl font-bold text-emerald-600">2</div>
                      <div className="text-sm text-emerald-700 font-medium">Offers</div>
                    </div>
                  </div>
                  <div className="space-y-4 mt-6">
                    <div className="text-sm font-semibold text-slate-800">Recent Applications</div>
                    <div className="space-y-3">
                      {recentApplications.map((job, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                              {job.company.charAt(0)}
                            </div>
                            <div>
                              <div className="font-medium text-slate-800">{job.position}</div>
                              <div className="text-sm text-slate-500">{job.company}</div>
                            </div>
                          </div>
                          <div className="text-xs text-slate-500 font-medium">{job.date}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -z-10 -bottom-8 -right-8 w-full h-full bg-gradient-to-br from-blue-400/20 to-indigo-500/20 rounded-2xl blur-xl"></div>
              <div className="absolute -z-10 -top-4 -left-4 w-24 h-24 bg-gradient-to-br from-purple-400/30 to-pink-500/30 rounded-full blur-xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900">
              Everything you need to
              <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                manage your job search
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Stop toggling between spreadsheets, calendars, and email. JobTrail brings it all together with intelligent automation.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map(
              (
                { id, icon: Icon, title, description }: {
                  id: string | number;
                  icon: React.ComponentType<{ className?: string }>;
                  title: string;
                  description: string;
                }
              ) => (
                <div
                  key={id}
                  className="group bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-0 hover:-translate-y-2"
                >
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="h-7 w-7 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-slate-800">{title}</h3>
                  <p className="text-slate-600 leading-relaxed">{description}</p>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-gradient-to-br from-slate-50 to-blue-50/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900">
              How JobTrail
              <span className="block bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                works
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Get started in minutes and take control of your job search with our streamlined process.
            </p>
          </div>
          <div className="max-w-5xl mx-auto relative">
            {/* Vertical center line */}
            <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gradient-to-b from-blue-400 to-indigo-500"></div>
            <div className="space-y-16">
              {steps.map(({ id, title, description }) => {
                const isRightAligned = id === 1 || id === 3;
                return (
                  <div
                    key={id}
                    className={`flex flex-col md:flex-row gap-8 items-center ${isRightAligned ? "md:flex-row-reverse" : ""}`}
                  >
                    {/* Content box */}
                    <div className="md:w-1/2">
                      <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200">
                        <h3 className="text-2xl font-bold mb-4 text-slate-800">{title}</h3>
                        <p className="text-slate-600 leading-relaxed text-lg">{description}</p>
                      </div>
                    </div>
                    {/* Number circle */}
                    <div className="md:w-1/2 flex justify-center">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center relative z-10 shadow-lg text-2xl font-bold">
                        {id}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=&quot;60&quot; height=&quot;60&quot; viewBox=&quot;0 0 60 60&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;%3E%3Cg fill=&quot;none&quot; fill-rule=&quot;evenodd&quot;%3E%3Cg fill=&quot;%23ffffff&quot; fill-opacity=&quot;0.05&quot;%3E%3Ccircle cx=&quot;36&quot; cy=&quot;24&quot; r=&quot;2&quot;/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">Ready to organize your job search?</h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto leading-relaxed">
            Join thousands of job seekers who have streamlined their job search process with JobTrail and landed their dream jobs.
          </p>
          <Link to="/register">
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-50 shadow-xl hover:shadow-2xl transition-all duration-300 px-8 py-4 text-lg font-semibold"
            >
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>

      <footer className="bg-slate-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold">JobTrail</h3>
              <p className="text-slate-400 leading-relaxed">
                The smart way to track your job applications and accelerate your career growth with intelligent insights.
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-lg">Quick Links</h4>
              <ul className="space-y-3">
                <li>
                  <a href="#features" className="text-slate-400 hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" className="text-slate-400 hover:text-white transition-colors">
                    How it Works
                  </a>
                </li>
                <li>
                  <Link to="/login" className="text-slate-400 hover:text-white transition-colors">
                    Login
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="text-slate-400 hover:text-white transition-colors">
                    Sign Up
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-lg">Legal</h4>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-slate-400 hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-400 hover:text-white transition-colors">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-slate-400">
            <p>© {new Date().getFullYear()} JobTrail. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;