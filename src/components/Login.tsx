import { login } from "../constants"

const Login = () => {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Feature Section - Hidden on mobile */}
      <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-green-600 to-teal-700 p-12 text-white relative overflow-hidden">
        <div className="relative z-10 my-auto">
          {/* Logo */}
          <div className="mb-12">
            <svg className="w-12 h-12" viewBox="0 0 40 40" fill="none">
              <path d="M20 40c11.046 0 20-8.954 20-20S31.046 0 20 0 0 8.954 0 20s8.954 20 20 20z" fill="white"/>
              <path d="M15 11l10 9-10 9V11z" fill="currentColor"/>
            </svg>
          </div>

          <h1 className="text-4xl font-bold mb-6 leading-tight">
            Welcome Back to JobTrail
          </h1>
          <p className="text-lg text-white/80 mb-8 max-w-md">
            Your personal job application manager - organize, track, and succeed.
          </p>

          {/* Feature List */}
          <ul className="space-y-6">
           {login.map(({ icon, title, desc }) => (
              <li key={title} className="flex items-start space-x-3">
                <span className="text-2xl mt-1">{icon}</span>
                <div>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="text-white/70 text-sm">{desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
      </div>

      {/* Right Login Section */}
      <div className="flex-1 flex items-center justify-center p-4 bg-gradient-to-tr from-green-50 via-white to-teal-50">
        <div className="w-full max-w-[440px] backdrop-blur-xl bg-white/60 p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/20">
          <div className="space-y-6">
            {/* Mobile Logo */}
            <div className="lg:hidden flex flex-col items-center space-y-3 mb-6">
              <svg className="w-12 h-12 text-green-700" viewBox="0 0 40 40" fill="none">
                <path d="M20 40c11.046 0 20-8.954 20-20S31.046 0 20 0 0 8.954 0 20s8.954 20 20 20z" fill="currentColor"/>
                <path d="M15 11l10 9-10 9V11z" fill="white"/>
              </svg>
              <h2 className="text-xl font-semibold text-gray-900">JobTrail</h2>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-green-700 to-teal-600 bg-clip-text text-transparent">
                Welcome back
              </h2>
              <p className="text-gray-600 text-sm">
                Sign in to manage your job applications and advance your career
              </p>
            </div>

            {/* Login Form */}
            <form  className="space-y-4">
              <div className="space-y-4">
                <div>
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="Email"
                      className="w-full px-4 py-3.5 rounded-xl text-sm bg-gray-50/50 border border-gray-200 
                      focus:bg-white focus:ring-2 focus:ring-green-600 focus:border-transparent
                      transition-all duration-200 placeholder-gray-400"
                    />
                      <span className="absolute -bottom-5 left-0 text-xs text-red-500 font-medium">
                      </span>
                  </div>
                </div>

                <div>
                  <div className="relative">
                    <input
                      type="password"
                      placeholder="Password"
                      className="w-full px-4 py-3.5 rounded-xl text-sm bg-gray-50/50 border border-gray-200 
                      focus:bg-white focus:ring-2 focus:ring-green-600 focus:border-transparent
                      transition-all duration-200 placeholder-gray-400"
                    />
                      <span className="absolute -bottom-5 left-0 text-xs text-red-500 font-medium">
                      </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="remember"
                    className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <label htmlFor="remember" className="ml-2 block text-sm text-gray-600">
                    Remember me
                  </label>
                </div>
                <a
                  href="/forgot-password"
                  className="text-sm font-medium text-green-600 hover:text-green-500"
                >
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                className="w-full relative py-3.5 px-4 rounded-xl text-sm font-medium text-white
                  bg-gradient-to-r from-green-700 to-teal-600 
                  hover:from-green-800 hover:to-teal-700
                  focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2
                  transition-all duration-200 ease-in-out
                  disabled:opacity-50 disabled:cursor-not-allowed
                  shadow-lg shadow-green-600/20 hover:shadow-green-600/30"
              >
                  Login
              </button>
            </form>

            {/* SSO Options */}
            {/* <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white/60 backdrop-blur-xl px-2 text-gray-500">
                    Or sign in with
                  </span>
                </div>
              </div>
              {/* sign in with google */}
              
             

                </div> 
            <p className="text-center text-sm text-gray-600">
              Don’t have an account?{' '}
              <a href="/register" className="font-semibold text-green-600 hover:text-green-500">
                Create one
              </a>
            </p>
          </div>
        </div>
      </div>
      
  )
}

export default Login