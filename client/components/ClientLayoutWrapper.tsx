// components/ClientLayoutWrapper.tsx
'use client';
import React, { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

const ClientLayoutWrapper = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();

  return (
    // This div provides padding for the bottom navbar (pb-20)
    // and serves as the container for animated page content.
    // min-h-screen ensures it takes at least the full viewport height.
    <div className="relative min-h-screen pb-20"> {/* pb-20 (5rem) should match navbar height (h-20) */}
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname} // Important for AnimatePresence to detect page changes
          initial={{ opacity: 0, y: 20 }} // Example entry animation
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}  // Example exit animation
          transition={{
            type: 'tween', // Or 'spring'
            ease: 'easeInOut',
            duration: 0.3, // Adjust duration
          }}
          className="pt-4 px-4 md:px-8" // Padding for the actual page content
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default ClientLayoutWrapper;