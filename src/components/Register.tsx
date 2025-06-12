import { register } from "../constants"

const Register = () => {
  return (
     <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Panel - Brand Content */}
      <div className="lg:w-[45%] bg-gradient-to-b from-blue-50 to-sky-50 p-8 lg:p-12 flex flex-col justify-between">
        <div className="space-y-12">
          {/* Logo */}
          <div className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-sky-700 bg-clip-text text-transparent">
            JobTrail
          </div>
          
          {/* Hero Content */}
          <div className="space-y-6">
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900 leading-tight">
              Track Your Applications - Stay Organized, Get Hired
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              Sign up to manage your job applications, interviews, and follow-ups all in one place.
            </p>
          </div>

          {/* Value Props */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {register.map((prop) => (
              <div key={prop.title} className="space-y-2">
                <div className="text-3xl">{prop.icon}</div>
                <h3 className="font-semibold text-gray-900">{prop.title}</h3>
                <p className="text-sm text-gray-600">{prop.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Social Proof */}
        <div className="hidden lg:block text-sm text-gray-500 mt-8">
          Helping 20,000+ job seekers stay ahead
        </div>
      </div>

      {/* Right Panel - Registration Form */}
      <div className="lg:w-[55%] px-8 lg:px-16 py-12 flex items-center justify-center bg-white">
        <div className="w-full max-w-[480px] space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">Create Your JobNest Account</h2>
            <p className="text-gray-600">Let's streamline your job hunt</p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">or use your email</span>
            </div>
          </div>

          {/* Registration Form */}
          <form  className="space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  className="mt-1 w-full px-4 py-3 rounded-xl border border-gray-300 shadow-sm
                    focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  type="email"
                  className="mt-1 w-full px-4 py-3 rounded-xl border border-gray-300 shadow-sm
                    focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  type="password"
                  className="mt-1 w-full px-4 py-3 rounded-xl border border-gray-300 shadow-sm
                    focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  placeholder="Create a password"
                />
                
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <input
                  type="password"
                  className="mt-1 w-full px-4 py-3 rounded-xl border border-gray-300 shadow-sm
                    focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  placeholder="Confirm your password"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-6 rounded-xl text-base font-semibold text-white
                bg-gradient-to-r from-blue-600 to-sky-600 
                hover:from-blue-700 hover:to-sky-700
                focus:outline-none focus:ring-4 focus:ring-blue-500/20
                transition-all duration-200 ease-in-out
                disabled:opacity-50 disabled:cursor-not-allowed
                transform hover:-translate-y-0.5"
            >
              Sign Up
            </button>

            <p className="text-center text-sm text-gray-600">
              Already tracking jobs?{' '}
              <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                Log in
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Register