'use client'; // Directive for Next.js App Router

import React, { useState } from 'react';
import { motion } from 'framer-motion'; // Import motion for animations
import { Eye, EyeOff, LogIn, Mail, Lock } from 'lucide-react'; // Icons
import { useRouter } from 'next/navigation';
import withGuest from '@/components/hoc/withGuest'; // HOC for guest-only access

// Login Page Component
const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const apiUrl = process.env.NEXT_PUBLIC_API_URL 
  const router = useRouter(); // Router instance for navigation

  const handleSubmit = async (e:any) => {
    e.preventDefault();
  
    try {
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies (for JWT in HTTP-only cookie)
        body: JSON.stringify({ email, password }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        alert(data.message || 'Login failed');
        return;
      }
  
      alert('Login successful!');
      router.push('/dashboard'); // Redirect to dashboard
    } catch (error) {
      console.error('Login error:', error);
      alert('An error occurred during login.');
    }
  };

  const handleSignup = () => {
    console.log('Redirecting to signup page...');
    router.push('/signup'); // Redirect to signup page
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#4A4A4A] p-4 overflow-hidden relative">
      
      {/* Animated background shapes */}
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

      {/* Form card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md p-8 md:p-10 bg-[#000000] rounded-2xl shadow-2xl border border-[#D4AF37]/40"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-[#D4AF37]">
          Welcome Back!
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#F5F5DC]/70" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-3 bg-[#1a1a1a] text-[#F5F5DC] border border-[#333] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] placeholder-gray-400"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#F5F5DC]/70" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
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

          {/* Forgot link */}
          <div className="text-right">
            <a href="#forgot-password" className="text-sm text-[#F5F5DC]/70 hover:text-[#D4AF37]">
              Forgot Password?
            </a>
          </div>

          {/* Submit */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full bg-[#6A1B9A] hover:bg-[#D4AF37] text-white font-semibold py-3 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6A1B9A] transition-all duration-300"
          >
            <div className="flex items-center justify-center">
              <LogIn className="w-5 h-5 mr-2" />
              Login
            </div>
          </motion.button>
        </form>

        {/* Signup link */}
        <p className="mt-8 text-center text-sm text-[#F5F5DC]/80">
          Don&apos;t have an account?{' '}
          <span
            onClick={handleSignup}
            className="font-medium text-[#D4AF37] hover:underline cursor-pointer"
          >
            Sign Up
          </span>
        </p>
      </motion.div>
    </div>
  );

};

export default withGuest(LoginPage);
