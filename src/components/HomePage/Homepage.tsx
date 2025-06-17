import { Link } from "react-router-dom";
import { ArrowRight} from "lucide-react";
import { Button } from "@/components/ui/button";
import { features, recentApplications, steps } from  "@/constants";
import Logo from "../../assets/logo.png"; // Adjust the path as necessary


const Homepage = () => {
  return (
    <div className="bg-white">
      <header className="fixed top-0 w-full bg-white/95 backdrop-blur z-50 border-b">
        <div className="container mx-auto px-2 py-2 flex justify-between items-center">
          <div className="flex items-center gap-2">
           <Link to="/">
            <img src={Logo} alt="JobTrail Logo" className="h-30 absolute z-10 top-[-2rem]" />
            </Link>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-gray-600 hover:text-blue-600 transition-colors">
              How it works
            </a>
            <Button variant="destructive" className="hidden md:inline-flex hover:bg-blue-600 hover:text-white transition-colors">
              <Link to="/register" className="text-gray-100 transition-colors ">
                Sign Up
              </Link>
            </Button>
          </div>

          <div className="md:hidden flex items-center gap-2">
            <Link to="/login">
              <Button variant="outline">
                Login
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="default">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </header>
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2 space-y-8">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Take charge of your career - track every opportunity with ease
              </h1>
              <p className="text-xl text-gray-600">
                Stop using spreadsheets. JobTrail helps you track applications, interviews, and offers in one place.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register">
                  <Button className="w-full sm:w-auto">
                    Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="secondary" className="w-full sm:w-auto">
                    Login
                  </Button>
                </Link>
              </div>
            </div>

            <div className="lg:w-1/2 relative">
              <div className="bg-white shadow-lg rounded-lg p-6 border">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <div className="ml-2 text-sm text-gray-500">Job Applications Dashboard</div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-md bg-blue-50 p-3 text-center">
                      <div className="text-3xl font-bold text-blue-600">12</div>
                      <div className="text-sm text-blue-700">Applied</div>
                    </div>
                    <div className="rounded-md bg-amber-50 p-3 text-center">
                      <div className="text-3xl font-bold text-amber-600">5</div>
                      <div className="text-sm text-amber-700">Interviews</div>
                    </div>
                    <div className="rounded-md bg-green-50 p-3 text-center">
                      <div className="text-3xl font-bold text-green-600">2</div>
                      <div className="text-sm text-green-700">Offers</div>
                    </div>
                  </div>

                  <div className="space-y-2 mt-4">
                    <div className="text-sm font-medium">Recent Applications</div>
                    <div className="space-y-2">
                      {recentApplications.map((job, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div>
                            <div className="font-medium">{job.position}</div>
                            <div className="text-sm text-gray-500">{job.company}</div>
                          </div>
                          <div className="text-xs text-gray-500">{job.date}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -z-10 -bottom-6 -right-6 w-full h-full bg-gradient-to-br from-primary/30 to-secondary/30 rounded-lg"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Everything you need to manage your job search</h2>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              Stop toggling between spreadsheets, calendars, and email. JobTrail brings it all together.
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
                <div key={id} className="bg-gray-300 p-6 rounded-lg shadow-md">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{title}</h3>
                  <p className="text-gray-900">{description}</p>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">How JobTrail works</h2>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              Get started in minutes and take control of your job search
            </p>
          </div>

          <div className="max-w-4xl mx-auto relative">
            {/* Vertical center line */}
            <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gray-600"></div>

            <div className="space-y-12">
              {steps.map(({ id, title, description }) => {
                const isRightAligned = id === 1 || id === 3;

                return (
                  <div
                    key={id}
                    className={`flex flex-col md:flex-row gap-8 items-center ${isRightAligned ? 'md:flex-row-reverse' : ''
                      }`}
                  >
                    {/* Content box */}
                    <div className="md:w-1/2">
                      <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h3 className="text-xl font-bold mb-2">{title}</h3>
                        <p className="text-gray-600">{description}</p>
                      </div>
                    </div>

                    {/* Number circle */}
                    <div className="md:w-1/2 flex justify-center">
                      <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center relative z-10">
                        {id}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>


      {/* CTA */}
      <section className="py-20   text-black">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to organize your job search?</h2>
          <p className="text-xl text- mb-8 max-w-2xl mx-auto">
            Join thousands of job seekers who have streamlined their job search process with JobTrail.
          </p>
          <Link to="/register">
            <Button size="lg" variant="default" className="hover:bg-blue-700 transition-colors">
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">JobTrail</h3>
              <p className="text-gray-400">
                The smart way to track your job applications and manage your career.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="text-gray-400 hover:text-white transition-colors">How it Works</a></li>
                <li><Link to="/login" className="text-gray-400 hover:text-white transition-colors">Login</Link></li>
                <li><Link to="/register" className="text-gray-400 hover:text-white transition-colors">Sign Up</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>© {new Date().getFullYear()} JobTrail. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;