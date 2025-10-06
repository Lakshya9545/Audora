// components/LenisProvider.tsx
'use client';

import { ReactLenis, useLenis as useReactLenisHook } from 'lenis/react'; // Renamed to avoid conflict
import type LenisInstance from 'lenis'; // Correct type import for Lenis instance
import type { LenisOptions } from 'lenis'; // Correct type import for Lenis options
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface LenisContextType {
  scrollProgress: number;
  isSmoothScrolling: boolean;
  lenisInstance: LenisInstance | null; // Expose Lenis instance if needed elsewhere
}

const LenisContext = createContext<LenisContextType | undefined>(undefined);

export const useLenis = (): LenisContextType => { // This is your custom hook
  const context = useContext(LenisContext);
  if (!context) {
    throw new Error('useLenis must be used within a LenisProvider');
  }
  return context;
};

interface LenisProviderProps {
  children: React.ReactNode;
  options?: Partial<LenisOptions>; // Use imported LenisOptions type
}

const DEFAULT_LENIS_OPTIONS: LenisOptions = { // Use imported LenisOptions type
  lerp: 0.1,
  duration: 1.2,
  touchMultiplier: 2,
  wheelMultiplier: 1,
  infinite: false,
  autoResize: true,
};

// Helper component to access Lenis instance and attach event listener
const LenisEventHandler: React.FC<{ 
  setScrollProgress: (progress: number) => void;
  setLenisInstanceForContext: (instance: LenisInstance | null) => void;
}> = ({ setScrollProgress, setLenisInstanceForContext }) => {
  const lenis = useReactLenisHook(); // This is the hook from 'lenis/react'

  useEffect(() => {
    setLenisInstanceForContext(lenis ?? null);
    if (lenis) {
      const handleScroll = (event: LenisInstance) => {
        const progress = Math.min(Math.max(event.progress, 0), 1);
        setScrollProgress(progress);
      };
      lenis.on('scroll', handleScroll);
      return () => {
        lenis.off('scroll', handleScroll);
      };
    }
  }, [lenis, setScrollProgress, setLenisInstanceForContext]);

  return null; // This component does not render anything itself
};

export function LenisProvider({ children, options = {} }: LenisProviderProps) {
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [isSmoothScrolling, setIsSmoothScrolling] = useState<boolean>(true);
  const [lenisInstance, setLenisInstance] = useState<LenisInstance | null>(null);

  const mergedOptions: LenisOptions = { ...DEFAULT_LENIS_OPTIONS, ...options };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSmoothScrolling(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ReactLenis root options={mergedOptions}>
      <LenisEventHandler 
        setScrollProgress={setScrollProgress} 
        setLenisInstanceForContext={setLenisInstance} 
      />
      <LenisContext.Provider value={{ scrollProgress, isSmoothScrolling, lenisInstance }}>
        {children}
      </LenisContext.Provider>
    </ReactLenis>
  );
}