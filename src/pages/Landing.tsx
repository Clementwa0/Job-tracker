import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, LayoutDashboard, BarChart, Bell, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Navigation = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/80 backdrop-blur-md shadow-lg' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex-shrink-0">
            <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              JobTrail
            </span>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-blue-600 transition-all hover:scale-105">
                Features
              </a>
              <a href="#testimonials" className="text-gray-700 hover:text-blue-600 transition-all hover:scale-105">
                Testimonials
              </a>
              <Link 
                to="/login"
                className="group flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-2.5 rounded-full hover:shadow-lg hover:scale-105 transition-all"
              >
                Get Started
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

const Hero = () => (
  <div className="pt-32 pb-16 bg-gradient-to-br from-blue-50 via-white to-blue-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div 
        className="flex flex-col md:flex-row items-center justify-between"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="md:w-1/2 space-y-8">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
            Track Your Job Search{' '}
            <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              Journey
            </span>
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Organize applications, track progress, and land your dream job faster with our intelligent tracking system.
          </p>
          <div className="flex gap-4 items-center">
            <Link 
              to="/login"
              className="group flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-8 py-4 rounded-full text-lg hover:shadow-lg hover:scale-105 transition-all"
            >
              Start Tracking
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a href="#features" className="text-blue-600 hover:text-blue-700 font-medium">
              Learn More →
            </a>
          </div>
        </div>
        <motion.div 
          className="md:w-1/2 mt-12 md:mt-0"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <img 
            src="/hero-image.svg" 
            alt="Job tracking dashboard" 
            className="w-full h-auto drop-shadow-2xl"
          />
        </motion.div>
      </motion.div>
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
    <section id="features" className="py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Powerful Features for Your{' '}
            <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              Job Search
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to manage your job search — stress-free and organized.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-105 border border-gray-100"
            >
              <div className="mb-6 bg-blue-50 w-14 h-14 rounded-xl flex items-center justify-center">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};


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