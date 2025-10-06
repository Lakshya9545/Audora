'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mic, PlayCircle, Radio, Share2, Users } from 'lucide-react'; // Added more icons

// GSAP Import
import { gsap } from 'gsap';
import { useEffect, useRef } from 'react';

const HeroSection = () => {
  const waveRef = useRef<HTMLDivElement>(null); // Added type for ref
  useEffect(() => {
    if (waveRef.current) {
      const tween = gsap.to(waveRef.current, { // Store the tween
        // Example: Simple wave-like movement
        y: '+=10',
        repeat: -1, // infinite
        yoyo: true, // back and forth
        duration: 2,
        ease: 'sine.inOut'
      });
      // Cleanup function
      return () => {
        tween.kill(); // Kill the specific tween instance
      };
    }
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <motion.section
      className="relative min-h-screen flex items-center justify-center text-center px-4 sm:px-6 lg:px-8 overflow-hidden bg-hero-gradient text-brightWhite"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Animated Background Wave (GSAP) */}
      <div ref={waveRef} className="absolute bottom-0 left-0 w-full opacity-10 z-0">
        {/* Simple SVG Wave */}
        <svg viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
          <path fill="#D4AF37" fillOpacity="0.5" d="M0,160L48,170.7C96,181,192,203,288,208C384,213,480,203,576,186.7C672,171,768,149,864,154.7C960,160,1056,192,1152,197.3C1248,203,1344,181,1392,170.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>

      <div className="relative z-10 max-w-3xl">
        <motion.h1
          className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl mb-4"
          variants={itemVariants}
        >
          Audora
        </motion.h1>
        <motion.h2
          className="text-2xl sm:text-3xl md:text-4xl font-semibold text-mutedGold mb-6"
          variants={itemVariants}
        >
          Sound Off. Be Heard.
        </motion.h2>
        <motion.p
          className="mt-3 text-base text-creamyTan sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0 mb-8"
          variants={itemVariants}
        >
          The social space where audio takes center stage. Share your stories,
          thoughts, and sounds. Discover voices that resonate.
        </motion.p>
        <motion.div
           className="mt-5 sm:mt-8 sm:flex sm:justify-center space-y-4 sm:space-y-0 sm:space-x-4"
           variants={itemVariants}
        >
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0px 0px 20px rgba(212, 175, 55, 0.6)" }} // Enhanced glow
            whileTap={{ scale: 0.95 }}
            className="w-full sm:w-auto flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full text-darkGray bg-mutedGold hover:opacity-90 md:py-3 md:text-lg md:px-10 transition-all duration-300 btn-shimmer animate-background-shimmer"
          >
            <Link href="/signup"> Explore Sounds </Link>  <PlayCircle className="ml-2 h-5 w-5" />
          </motion.button>
           <motion.button
            whileHover={{ scale: 1.05, backgroundColor: 'rgba(212, 175, 55, 0.15)', borderColor: 'rgba(212, 175, 55, 0.8)' }} // Enhanced hover
            whileTap={{ scale: 0.95 }}
            className="w-full sm:w-auto flex items-center justify-center px-8 py-3 border border-mutedGold text-base font-medium rounded-full text-mutedGold hover:text-brightWhite md:py-3 md:text-lg md:px-10 transition-all duration-300"
          >
           <Link href="/login"> Log In </Link>  <Mic className="ml-2 h-5 w-5" />
          </motion.button>
        </motion.div>

        {/* Feature Snippets */}
        <motion.div
          className="mt-12 pt-8 border-t border-mutedGold/20 flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-8 text-creamyTan/80"
          variants={itemVariants} // Reuse item variant for fade-in
        >
          <div className="flex items-center">
            <Radio className="w-5 h-5 mr-2 text-mutedGold" />
            <span>Explore Trending Audio</span>
          </div>
          <div className="flex items-center">
            <Share2 className="w-5 h-5 mr-2 text-mutedGold" />
            <span>Share Your Voice</span>
          </div>
          <div className="flex items-center">
            <Users className="w-5 h-5 mr-2 text-mutedGold" />
            <span>Connect with Creators</span>
          </div>
        </motion.div>
      </div>
        {/* Optional: Add subtle particle effects or more background animations here */}
    </motion.section>
  );
};

export default HeroSection;