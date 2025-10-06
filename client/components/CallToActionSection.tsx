'use client';

import { motion } from 'framer-motion';
import { Sparkles, Mic, Users, Radio } from 'lucide-react'; // Added more icons
import Link from 'next/link'; // Import Link for navigation

const CallToActionSection = () => {
  const featureVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <motion.section
      id="cta"
      // Added a subtle gradient and relative positioning for potential background elements
      className="relative bg-gradient-to-b from-richPurple to-purple-900 py-20 sm:py-28 text-center px-4 sm:px-6 lg:px-8 overflow-hidden"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8 }}
    >
      {/* Optional: Add subtle background shapes/patterns here */}
      <motion.div
        className="absolute top-10 left-10 w-48 h-48 bg-mutedGold/10 rounded-full blur-3xl -translate-x-1/2"
        animate={{ scale: [1, 1.1, 1], rotate: [0, 10, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />
       <motion.div
        className="absolute bottom-10 right-10 w-56 h-56 bg-brightWhite/5 rounded-xl blur-3xl translate-x-1/2"
        animate={{ scale: [1, 0.9, 1], rotate: [0, -15, 0] }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10">
        <motion.h2
          className="text-3xl font-bold tracking-tight text-brightWhite sm:text-4xl lg:text-5xl mb-4"
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Ready to Make Some Noise?
        </motion.h2>
        <motion.p
          className="mt-4 text-lg leading-7 text-creamyTan max-w-2xl mx-auto mb-10"
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          Join the Audora community today. Share your unique voice, discover captivating audio content,
          and connect with creators and listeners from around the globe.
        </motion.p>

        {/* Mini Feature Highlights */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto mb-12 text-creamyTan/90"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          transition={{ staggerChildren: 0.2 }}
        >
          <motion.div className="flex flex-col items-center" variants={featureVariants}>
            <Mic className="h-8 w-8 mb-2 text-mutedGold" />
            <h3 className="font-semibold mb-1">Share Easily</h3>
            <p className="text-sm text-creamyTan/70">Upload your audio in moments.</p>
          </motion.div>
          <motion.div className="flex flex-col items-center" variants={featureVariants}>
            <Radio className="h-8 w-8 mb-2 text-mutedGold" />
            <h3 className="font-semibold mb-1">Discover Sounds</h3>
            <p className="text-sm text-creamyTan/70">Explore a universe of audio.</p>
          </motion.div>
          <motion.div className="flex flex-col items-center" variants={featureVariants}>
            <Users className="h-8 w-8 mb-2 text-mutedGold" />
            <h3 className="font-semibold mb-1">Connect</h3>
            <p className="text-sm text-creamyTan/70">Follow creators and build community.</p>
          </motion.div>
        </motion.div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0px 0px 15px rgba(212, 175, 55, 0.5)" }}
            whileTap={{ scale: 0.95 }}
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.6, type: 'spring', stiffness: 150 }}
            className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full text-darkGray bg-mutedGold hover:opacity-90 md:py-3 md:text-lg md:px-10 transition-opacity duration-300 shadow-lg hover:shadow-mutedGold/30"
          >
             <Link href="/signup"> Sign Up Now </Link> <Sparkles className="ml-2 h-5 w-5" />
          </motion.button>
          {/* Added Secondary Button */}
          <motion.div // Wrap Link in motion.div for animation
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <Link
              href="#features"
              className="inline-flex items-center justify-center px-8 py-3 border border-mutedGold text-base font-medium rounded-full text-mutedGold hover:bg-mutedGold/10 md:py-3 md:text-lg md:px-10 transition-colors duration-300"
            >
              Learn More
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};

export default CallToActionSection;