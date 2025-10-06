'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, UserPlus, Mail, Lock, User as UserIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import withGuest from '@/components/hoc/withGuest';

const SignupPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        const message = data?.errors
          ? data.errors.map((err: any) => err.message).join(', ')
          : data.message || 'Signup failed';
        setError(message);
        return;
      }

      alert('Signup successful! Please log in.');
      setUsername('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      router.push('/login'); // Redirect to login page after successful signup
    } catch (err) {
      console.error(err);
      setError('Something went wrong during signup.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginRedirect = () => {
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#4A4A4A] p-4 overflow-hidden relative">
      <motion.div
        className="absolute top-12 left-12 w-36 h-36 bg-[#D4AF37] rounded-full opacity-20 blur-2xl"
        animate={{ scale: [1, 1.1, 1], rotate: [0, 15, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-12 right-12 w-48 h-48 bg-[#6A1B9A] rounded-xl opacity-20 blur-2xl"
        animate={{ scale: [1, 0.9, 1], rotate: [0, -10, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md p-8 md:p-10 bg-[#000000] rounded-2xl shadow-2xl border border-[#D4AF37]/40"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-[#D4AF37]">Create Account</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#F5F5DC]/70" />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-3 bg-[#1a1a1a] text-[#F5F5DC] border border-[#333] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] placeholder-gray-400"
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#F5F5DC]/70" />
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-3 bg-[#1a1a1a] text-[#F5F5DC] border border-[#333] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] placeholder-gray-400"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#F5F5DC]/70" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full pl-10 pr-12 py-3 bg-[#1a1a1a] text-[#F5F5DC] border border-[#333] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] placeholder-gray-400"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#F5F5DC]/70 hover:text-[#D4AF37]"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#F5F5DC]/70" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="w-full pl-10 pr-12 py-3 bg-[#1a1a1a] text-[#F5F5DC] border border-[#333] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] placeholder-gray-400"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#F5F5DC]/70 hover:text-[#D4AF37]"
              aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center p-2 bg-red-500/10 rounded-md">
              {error}
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#6A1B9A] hover:bg-[#D4AF37] text-white font-semibold py-3 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6A1B9A] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center justify-center">
              {isLoading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <UserPlus className="w-5 h-5 mr-2" />
              )}
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </div>
          </motion.button>
        </form>

        <p className="mt-8 text-center text-sm text-[#F5F5DC]/80">
          Already have an account?{' '}
          <span
            onClick={handleLoginRedirect}
            className="font-medium text-[#D4AF37] hover:underline cursor-pointer"
          >
            Login
          </span>
        </p>
      </motion.div>
    </div>
  );
};

export default withGuest(SignupPage);
