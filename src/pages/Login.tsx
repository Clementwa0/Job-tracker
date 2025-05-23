import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const { login } = useAuth();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login({
        email: data.email,
        password: data.password
      });
      toast.success('Login successful!');
    } catch (error) {
      toast.error('Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-blue-50 via-white to-purple-50 p-4">
      <div className="w-full max-w-[400px] backdrop-blur-xl bg-white/60 p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/20">
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent text-center">
              Welcome back
            </h1>
            <p className="text-gray-500 text-center text-sm">
              Please sign in to continue to your account
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div>
                <div className="relative">
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="Email"
                    className="w-full px-4 py-3.5 rounded-xl text-sm bg-gray-50/50 border border-gray-200 
                    focus:bg-white focus:ring-2 focus:ring-violet-500 focus:border-transparent
                    transition-all duration-200 placeholder-gray-400"
                  />
                  {errors.email && (
                    <span className="absolute -bottom-5 left-0 text-xs text-red-500 font-medium">
                      {errors.email.message}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <div className="relative">
                  <input
                    {...register('password')}
                    type="password"
                    placeholder="Password"
                    className="w-full px-4 py-3.5 rounded-xl text-sm bg-gray-50/50 border border-gray-200 
                    focus:bg-white focus:ring-2 focus:ring-violet-500 focus:border-transparent
                    transition-all duration-200 placeholder-gray-400"
                  />
                  {errors.password && (
                    <span className="absolute -bottom-5 left-0 text-xs text-red-500 font-medium">
                      {errors.password.message}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full relative py-3.5 px-4 rounded-xl text-sm font-medium text-white
                bg-gradient-to-r from-violet-600 to-indigo-600 
                hover:from-violet-700 hover:to-indigo-700
                focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2
                transition-all duration-200 ease-in-out
                disabled:opacity-50 disabled:cursor-not-allowed
                shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center space-x-2">
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Authenticating...</span>
                </div>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white/60 backdrop-blur-xl px-2 text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center px-4 py-3 rounded-xl border border-gray-200 bg-white/50 hover:bg-white/80 transition-colors duration-200">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              </button>
              <button className="flex items-center justify-center px-4 py-3 rounded-xl border border-gray-200 bg-white/50 hover:bg-white/80 transition-colors duration-200">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13.397 20.997v-8.196h2.765l.411-3.209h-3.176V7.548c0-.926.258-1.56 1.587-1.56h1.684V3.127A22.336 22.336 0 0 0 14.201 3c-2.444 0-4.122 1.492-4.122 4.231v2.355H7.332v3.209h2.753v8.202h3.312z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
