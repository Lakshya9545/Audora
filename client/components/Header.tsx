'use client'; // Needed for Framer Motion and state

import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Zap } from 'lucide-react'; // Example icon
import { useRouter } from 'next/navigation'// For navigation
const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const router = useRouter();
  const menuVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
  };
  const signup = () => router.push('/signup');

  return (
    <header className="sticky top-0 z-50 bg-richPurple/80 backdrop-blur-md text-brightWhite shadow-md">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
          <Zap className="text-mutedGold h-6 w-6" /> {/* Example Logo Icon */}
          <span className="font-bold text-xl">Audora</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-6">
          <Link href="#features" className="hover:text-mutedGold transition-colors">Features</Link>
          <Link href="#cta" className="hover:text-mutedGold transition-colors">Get Started</Link>
          <motion.button
             whileHover={{ scale: 1.05 }}
             whileTap={{ scale: 0.95 }}
             className="bg-mutedGold text-darkGray px-4 py-2 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <Link href="/signup"> Sign Up </Link>
          </motion.button>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button onClick={toggleMobileMenu} aria-label="Toggle menu">
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="md:hidden absolute top-16 left-0 w-full bg-richPurple/95 backdrop-blur-lg shadow-xl pb-4"
            onClick={() => setMobileMenuOpen(false)} // Close on click outside links maybe?
          >
            <div className="flex flex-col items-center space-y-4 pt-4">
              <Link href="#features" className="hover:text-mutedGold transition-colors block px-4 py-2">Features</Link>
              <Link href="#cta" className="hover:text-mutedGold transition-colors block px-4 py-2">Get Started</Link>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-mutedGold text-darkGray px-6 py-2 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity"
                
              >
                <Link href="/signup"> Sign Up </Link>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;