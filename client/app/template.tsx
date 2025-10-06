// app/template.tsx
'use client';
import {
  motion,
  AnimatePresence,
  useReducedMotion,
} from 'framer-motion';
import { useEffect, useState, useCallback } from 'react';
import AnimatedCursor from 'react-animated-cursor'; // Import the new cursor
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim"; // loads tsparticles-slim
import type { Engine } from "tsparticles-engine";

// Custom hook for page transition state
function usePageTransition() {
  const prefersReducedMotion = useReducedMotion();
  return { prefersReducedMotion };
}

// New, more amazing animation variants
const pageContentVariants = {
  initial: { opacity: 0, scale: 0.98 },
  enter: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: 'easeOut', delay: 0.6 },
  },
  exit: {
    opacity: 0,
    scale: 1.02,
    transition: { duration: 0.3, ease: 'easeIn' },
  },
};

// Shutter effect variants
const shutterContainerVariants = {
  enter: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
  exit: {
    transition: { staggerChildren: 0.08, staggerDirection: -1 },
  },
};

const shutterVariants = {
  initial: { y: '100vh' },
  enter: { y: ['100vh', '0vh', '-100vh'], transition: { duration: 1.2, ease: [0.76, 0, 0.24, 1] as any, times: [0, 0.5, 1] } },
  exit: { y: '-100vh', transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] as any } },
};


// Reduced motion variants for accessibility
const reducedMotionVariants = {
  initial: { opacity: 0 },
  enter: {
    opacity: 1,
    transition: { duration: 0.3 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

export default function Template({ children }: { children: React.ReactNode }) {
  const { prefersReducedMotion } = usePageTransition();
  const [mounted, setMounted] = useState(false);

  // Particles setup
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  const variants = prefersReducedMotion ? reducedMotionVariants : pageContentVariants;

  if (!mounted) {
    return <div style={{ opacity: 0 }}>{children}</div>;
  }

  return (
    <div className="relative bg-black">
      {!prefersReducedMotion && (
        <Particles
          id="tsparticles"
          init={particlesInit}
          options={{
            background: {
              color: {
                value: '#0d0d0d',
              },
            },
            fpsLimit: 60,
            interactivity: {
              events: {
                onHover: {
                  enable: true,
                  mode: 'repulse',
                },
                resize: true,
              },
              modes: {
                repulse: {
                  distance: 80,
                  duration: 0.4,
                },
              },
            },
            particles: {
              color: {
                value: '#ffffff',
              },
              links: {
                color: '#ffffff',
                distance: 150,
                enable: true,
                opacity: 0.1,
                width: 1,
              },
              move: {
                direction: 'none',
                enable: true,
                outModes: {
                  default: 'bounce',
                },
                random: false,
                speed: 0.5,
                straight: false,
              },
              number: {
                density: {
                  enable: true,
                  area: 800,
                },
                value: 80,
              },
              opacity: {
                value: 0.1,
              },
              shape: {
                type: 'circle',
              },
              size: {
                value: { min: 1, max: 3 },
              },
            },
            detectRetina: true,
          }}
          className="fixed inset-0 z-0"
        />
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={Date.now()} // Simple key to force re-animation
          variants={variants}
          initial="initial"
          animate="enter"
          exit="exit"
          className="relative z-10"
        >
          {children}
        </motion.div>
      </AnimatePresence>

      {/* Shutter Transition Effect */}
      {!prefersReducedMotion && (
        <motion.div
          className="fixed inset-0 flex pointer-events-none z-[100] overflow-hidden"
          variants={shutterContainerVariants}
          initial="initial"
          animate="enter"
          exit="exit"
        >
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              variants={shutterVariants}
              className="flex-1 bg-gradient-to-b from-gray-900 via-purple-900 to-black"
            />
          ))}
        </motion.div>
      )}

      {/* Custom Cursor - As requested */}
      {mounted && !prefersReducedMotion && (
        <AnimatedCursor
          innerSize={10}
          outerSize={35}
          color='193, 11, 237'
          outerAlpha={0.3}
          innerScale={0.7}
          outerScale={2}
          clickables={[
            'a',
            'input[type="text"]',
            'input[type="email"]',
            'input[type="number"]',
            'input[type="submit"]',
            'input[type="image"]',
            'label[for]',
            'select',
            'textarea',
            'button',
            '.link'
          ]}
        />
      )}

      {/* Loading state indicator - Kept from original */}
      <AnimatePresence>
        <motion.div
            className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 z-[200]"
            initial={{ scaleX: 0, transformOrigin: 'left' }}
            animate={{ scaleX: 1, transition: { duration: 1, ease: 'circOut' } }}
            exit={{ scaleX: 0, transformOrigin: 'right', transition: { duration: 0.6, ease: 'circIn' } }}
        />
      </AnimatePresence>
    </div>
  );
}