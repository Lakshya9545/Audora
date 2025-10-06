'use client';

import { motion } from 'framer-motion';
import { Radio, Mic, Users, ListMusic, Waves } from 'lucide-react'; // Icons

// Wrapper for scroll animations (reusable)
// Add id prop to the type definition
const AnimatedSection = ({ children, className, id }: { children: React.ReactNode, className?: string, id?: string }) => {
    return (
        <motion.section
            id={id} // Pass the id prop to the motion.section
            className={className}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }} // Trigger when 20% is visible, only once
            transition={{ staggerChildren: 0.2 }}
        >
            {children}
        </motion.section>
    );
};

const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const BentoCard = ({ children, className, title, icon: Icon }: { children: React.ReactNode, className?: string, title: string, icon: React.ElementType }) => {
    return (
        <motion.div
            variants={itemVariants}
            className={`rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 ${className}`} // Base card styles
            whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
        >
             <div className="flex items-center mb-3">
                <Icon className="h-6 w-6 mr-3 text-richPurple" />
                <h3 className="text-xl font-semibold text-darkGray">{title}</h3>
            </div>
            <div className="text-darkSlate text-sm">
                {children}
            </div>
        </motion.div>
    );
};


const FeaturesBentoGrid = () => {
  return (
    <AnimatedSection id="features" className="py-16 sm:py-24 bg-creamyTan px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl font-bold tracking-tight text-darkGray sm:text-4xl">
          Your Audio Universe
        </h2>
        <p className="mt-4 text-lg text-darkSlate max-w-2xl mx-auto">
          Discover, share, and connect through the power of sound.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {/* Card 1: Explore (Larger) */}
        <BentoCard
          title="Explore & Discover"
          icon={Radio}
          className="md:col-span-2 bg-dustyRose/70 min-h-[200px]" // Example size and color
        >
          <p>Dive into a world of sounds. Find trending topics, new creators, and stories waiting to be heard on the Explore feed.</p>
          {/* Mockup element: Could add a simple animated waveform here */}
           <Waves className="w-16 h-auto mt-4 text-richPurple opacity-50" />
        </BentoCard>

        {/* Card 2: Share */}
        <BentoCard
          title="Share Your Voice"
          icon={Mic}
          className="bg-brightWhite" // Example color
        >
          <p>Easily upload your audio (MP3/WAV). Add a title, subject, and description to share your perspective with the world.</p>
        </BentoCard>

        {/* Card 3: Profile */}
        <BentoCard
          title="Build Your Profile"
          icon={Users}
          className="bg-brightWhite" // Example color
        >
          <p>Create your unique space. Customize your profile, showcase your posts, and connect by following others.</p>
        </BentoCard>

        {/* Card 4: Feed */}
        <BentoCard
          title="Curated Feed"
          icon={ListMusic}
          className="md:col-span-2 bg-dustyRose/70 min-h-[200px]" // Example size and color
        >
          <p>Stay updated with sounds from the creators you follow. Your personalized Home feed brings their latest posts directly to you.</p>
           {/* Mockup element */}
           <div className="flex space-x-2 mt-4">
            <div className="h-10 w-10 rounded-full bg-richPurple"></div>
            <div className="h-10 w-10 rounded-full bg-mutedGold"></div>
            <div className="h-10 w-10 rounded-full bg-darkSlate"></div>
           </div>
        </BentoCard>
      </div>
    </AnimatedSection>
  );
};

export default FeaturesBentoGrid;