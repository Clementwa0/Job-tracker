import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, LayoutDashboard, BarChart, Bell } from 'lucide-react'


const Navigation = () => (
  <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-sm z-50 shadow-sm">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between h-16 items-center">
        <div className="flex-shrink-0">
          <span className="text-2xl font-bold text-blue-600">JobTrail</span>
        </div>
        <div className="hidden md:block">
          <div className="ml-10 flex items-center space-x-8">
            <a href="#features" className="text-gray-700 hover:text-blue-600 transition">Features</a>
            <a href="#testimonials" className="text-gray-700 hover:text-blue-600 transition">Testimonials</a>
            <Link to="/login" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </div>
  </nav>
);

const Hero = () => (
  <div className="pt-24 pb-16 bg-gradient-to-br from-blue-50 to-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row items-center justify-between">
        <div className="md:w-1/2 space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
            Track Your Job Search Journey
          </h1>
          <p className="text-xl text-gray-600">
            Organize applications, track progress, and land your dream job faster.
          </p>
          <Link to="/login" className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg text-lg hover:bg-blue-700 transition">
            Start Tracking
          </Link>
        </div>
        <div className="md:w-1/2 mt-8 md:mt-0">
          <img 
            src="/hero-image.svg" 
            alt="Job tracking dashboard" 
            className="w-full h-auto"
          />
        </div>
      </div>
    </div>
  </div>
);


const features = [
  {
    icon: <Briefcase className="w-6 h-6 text-primary" />,
    title: "Track Job Applications",
    description: "Manage every job you apply to - from saved to accepted - in a simple, organized way.",
  },
  {
    icon: <LayoutDashboard className="w-6 h-6 text-primary" />,
    title: "Visual Grid Board",
    description: "Drag and drop job cards across stages like Applied, Interviewing, and Offer.",
  },
  {
    icon: <BarChart className="w-6 h-6 text-primary" />,
    title: "Analytics Dashboard",
    description: "Get insights into your job hunt - success rate, interview counts, and more.",
  },
  {
    icon: <Bell className="w-6 h-6 text-primary" />,
    title: "Automated Reminders",
    description: "Set follow-up reminders and never miss another opportunity.",
  },
]

const Features = () => {
  return (
    <section id="features" className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">Key Features</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-12">
          Everything you need to manage your job search — stress-free.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow hover:shadow-lg transition"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}


const TestimonialCard = ({ text, name, role, avatar }: { text: string; name: string; role: string; avatar: string }) => (
  <div className="p-6 bg-white rounded-xl shadow-sm">
    <p className="text-gray-600 mb-4">"{text}"</p>
    <div className="flex items-center">
      <img src={avatar} alt={name} className="w-12 h-12 rounded-full mr-4" />
      <div>
        <h4 className="font-semibold text-gray-900">{name}</h4>
        <p className="text-gray-500 text-sm">{role}</p>
      </div>
    </div>
  </div>
);

const Testimonials = () => (
  <section id="testimonials" className="py-16">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">What Our Users Say</h2>
      <div className="grid md:grid-cols-2 gap-8">
        <TestimonialCard
          text="JobTrail helped me stay organized during my job search. I landed my dream job in half the time!"
          name="Sarah Johnson"
          role="Software Engineer"
          avatar="/avatar1.png"
        />
        <TestimonialCard
          text="The best job application tracking tool I've ever used. Simple yet powerful!"
          name="Michael Chen"
          role="Product Manager"
          avatar="/avatar2.png"
        />
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="bg-gray-900 text-gray-300 py-12">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-xl font-bold text-white mb-4">JobTrail</h3>
          <p className="text-sm">Making job search organized and efficient.</p>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Links</h4>
          <ul className="space-y-2">
            <li><a href="#" className="hover:text-white transition">About</a></li>
            <li><a href="#" className="hover:text-white transition">Privacy</a></li>
            <li><a href="#" className="hover:text-white transition">Terms</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Connect</h4>
          <div className="flex space-x-4">
            <a href="#" className="hover:text-white transition">Twitter</a>
            <a href="#" className="hover:text-white transition">GitHub</a>
            <a href="#" className="hover:text-white transition">LinkedIn</a>
          </div>
        </div>
      </div>
      <div className="mt-8 pt-8 border-t border-gray-800 text-center">
        <p>&copy; 2025 JobTrail. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

const Landing = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <Hero />
      <Features />
      <Testimonials />
      <Footer />
    </div>
  );
};

export default Landing;