import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { Github, Chrome, Laptop, Apple } from 'lucide-react';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function Register() {
  const { register: registerUser } = useAuth();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password
      });
      toast.success('Registration successful!');
    } catch (error) {
      toast.error('Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Panel - Brand Content */}
      <div className="lg:w-[45%] bg-gradient-to-b from-blue-50 to-sky-50 p-8 lg:p-12 flex flex-col justify-between">
        <div className="space-y-12">
          {/* Logo */}
          <div className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-sky-700 bg-clip-text text-transparent">
            JobNest
          </div>
          
          {/* Hero Content */}
          <div className="space-y-6">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
              Track Your Applications – Stay Organized, Get Hired
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              Sign up to manage your job applications, interviews, and follow-ups all in one place.
            </p>
          </div>

          {/* Value Props */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                icon: "📈",
                title: "Track Progress",
                desc: "Visualize your job hunt journey"
              },
              {
                icon: "🔔",
                title: "Smart Alerts",
                desc: "Never miss deadlines or interviews"
              },
              {
                icon: "📋",
                title: "Centralized",
                desc: "All your job data in one hub"
              }
            ].map((prop) => (
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
            <p className="text-gray-600">Let’s streamline your job hunt</p>
          </div>

          {/* SSO Buttons */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { name: 'Google', icon: Chrome, color: '#4285F4' },
              { name: 'GitHub', icon: Github, color: '#24292F' },
              { name: 'Microsoft', icon: Laptop, color: '#00A4EF' },
              { name: 'Apple', icon: Apple, color: '#000000' }
            ].map((provider) => {
              const Icon = provider.icon;
              return (
                <button
                  key={provider.name}
                  className="flex items-center justify-center gap-2 py-2.5 px-4 border border-gray-300 rounded-xl
                    hover:bg-gray-50 transition-all duration-200 text-gray-700 text-sm font-medium"
                >
                  <Icon className="w-5 h-5" style={{ color: provider.color }} />
                  <span>{provider.name}</span>
                </button>
              );
            })}
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
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              {/* Name Input */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  {...register('name')}
                  type="text"
                  className="mt-1 w-full px-4 py-3 rounded-xl border border-gray-300 shadow-sm
                    focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  placeholder="Enter your full name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  {...register('email')}
                  type="email"
                  className="mt-1 w-full px-4 py-3 rounded-xl border border-gray-300 shadow-sm
                    focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              {/* Password Input */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  {...register('password')}
                  type="password"
                  className="mt-1 w-full px-4 py-3 rounded-xl border border-gray-300 shadow-sm
                    focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  placeholder="Create a password"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
                )}
              </div>

              {/* Confirm Password Input */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <input
                  {...register('confirmPassword')}
                  type="password"
                  className="mt-1 w-full px-4 py-3 rounded-xl border border-gray-300 shadow-sm
                    focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  placeholder="Confirm your password"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-6 rounded-xl text-base font-semibold text-white
                bg-gradient-to-r from-blue-600 to-sky-600 
                hover:from-blue-700 hover:to-sky-700
                focus:outline-none focus:ring-4 focus:ring-blue-500/20
                transition-all duration-200 ease-in-out
                disabled:opacity-50 disabled:cursor-not-allowed
                transform hover:-translate-y-0.5"
            >
              {isSubmitting ? 'Creating Account...' : 'Sign Up for JobNest'}
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
  );
}
