'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/firebase';
import Link from 'next/link';
import NavBar from '@/components/NavBar';

// Utility function to sanitize inputs
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  
  // Remove HTML tags and scripts
  const sanitized = input
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .trim();
    
  return sanitized;
};

// Validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({
    email: '',
    password: '',
  });
  const router = useRouter();
  const { login } = useAuth();

  const validateForm = () => {
    const errors = {
      email: '',
      password: '',
    };
    
    // Validate email
    if (!email) {
      errors.email = 'Email is required';
    } else if (!isValidEmail(email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    // Validate password
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    setValidationErrors(errors);
    
    // Return true if there are no errors
    return !errors.email && !errors.password;
  };

  const handleEmailChange = (e) => {
    const sanitized = sanitizeInput(e.target.value);
    setEmail(sanitized);
    
    // Clear validation error when user types
    if (validationErrors.email) {
      setValidationErrors({
        ...validationErrors,
        email: '',
      });
    }
  };

  const handlePasswordChange = (e) => {
    const sanitized = sanitizeInput(e.target.value);
    setPassword(sanitized);
    
    // Clear validation error when user types
    if (validationErrors.password) {
      setValidationErrors({
        ...validationErrors,
        password: '',
      });
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate form before submission
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Rate limiting check (could be enhanced with proper backend implementation)
      const lastAttemptTime = sessionStorage.getItem('lastLoginAttempt');
      const now = Date.now();
      
      if (lastAttemptTime && now - parseInt(lastAttemptTime) < 1000) {
        throw new Error('Too many login attempts. Please try again in a moment.');
      }
      
      sessionStorage.setItem('lastLoginAttempt', now.toString());
      
      await login(email, password);
      router.push('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      setError('Failed to log in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-green-50 to-white">
      <NavBar />
      <div className="flex-1 flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 relative">
        {/* Background decorative elements */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-green-100 rounded-full opacity-50 blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-100 rounded-full opacity-50 blur-3xl"></div>
        </div>
        
        <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
          <div className="text-center">
            <h2 className="text-2xl xs:text-3xl font-extrabold text-gray-900 tracking-tight">
              Welcome Back
            </h2>
            <p className="mt-2 text-sm text-gray-600 max-w">
              Sign in to access your AI traffic analytics
            </p>
          </div>
        </div>

        <div className="mt-6 sm:mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
          <div className="bg-white py-6 sm:py-8 px-4 shadow-2xl sm:rounded-xl sm:px-10 border border-gray-100">
            <form className="space-y-6" onSubmit={handleLogin}>
              {error && (
                <div className="rounded-lg bg-red-50 p-4 border border-red-100">
                  <div className="text-sm text-red-700 font-medium">{error}</div>
                </div>
              )}
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={handleEmailChange}
                    maxLength={100}
                    className={`appearance-none block w-full px-3 py-2.5 border ${validationErrors.email ? 'border-red-300' : 'border-gray-300'} rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-supabase-green focus:border-supabase-green sm:text-sm`}
                    placeholder="you@example.com"
                  />
                  {validationErrors.email && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={handlePasswordChange}
                    maxLength={100}
                    className={`appearance-none block w-full px-3 py-2.5 border ${validationErrors.password ? 'border-red-300' : 'border-gray-300'} rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-supabase-green focus:border-supabase-green sm:text-sm`}
                    placeholder="Enter your password"
                  />
                  {validationErrors.password && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
                  )}
                </div>
                <div className="flex items-center justify-end mt-2">
                  <Link href="/forgot-password" className="text-sm font-medium text-supabase-green hover:text-supabase-green transition-colors duration-200">
                    Forgot your password?
                  </Link>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-supabase-green hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-supabase-green disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or</span>
                </div>
              </div>

              <div className="mt-6 text-center">
                <Link 
                  href="/signup" 
                  className="font-medium text-supabase-green hover:text-supabase-green transition-colors duration-200"
                >
                  Create a new account
                </Link>
              </div>
            </div>
            
            <div className="mt-8 pt-6 text-center border-t border-gray-100">
              <p className="text-xs text-gray-500">
                By signing in, you agree to our{' '}
                <a href="#" className="text-supabase-green hover:text-supabase-green">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-supabase-green hover:text-supabase-green">
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}