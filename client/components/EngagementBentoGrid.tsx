'use client';

import { motion } from 'framer-motion';
import { ThumbsUp, Sparkles, MessageSquareText, Users2, Heart, User, TrendingUp, MessageCircle, Info, Share2, Eye, RotateCcw } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

// Animation Wrapper
const AnimatedSection = ({ children, className, id }: { children: React.ReactNode, className?: string, id?: string }) => {
    return (
        <motion.section
            id={id}
            className={className}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
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

// Refactored BentoCard component
const BentoCard = ({
    children, // Front face main content
    title,
    icon: Icon,
    iconClassName, // For front face icon
    titleClassName, // For front face title
    contentClassName, // For front face main content text
    backContent, // JSX for the back face
    containerClassName, // For layout of the main flipping div (min-height, col-span)
    frontFaceStyles,    // Tailwind classes for the front face (bg, padding, text colors etc.)
    backFaceStyles      // Tailwind classes for the back face (bg, padding, text colors etc.)
}: {
    children: React.ReactNode;
    title: string;
    icon: React.ElementType;
    iconClassName?: string;
    titleClassName?: string;
    contentClassName?: string;
    backContent?: React.ReactNode;
    containerClassName?: string;
    frontFaceStyles?: string;
    backFaceStyles?: string;
}) => {
    const cardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const card = cardRef.current;
        if (!card) return;

        const tl = gsap.timeline({ repeat: -1, repeatDelay: 5 });
        tl.to(card, { rotationY: 180, duration: 0.5, ease: 'power2.inOut' })
          .to(card, { rotationY: 360, duration: 0.5, ease: 'power2.inOut', delay: 4 })
          .set(card, { rotationY: 0 });

        return () => {
            tl.kill();
        };
    }, []);

    return (
        <motion.div // Main container for layout and 3D perspective
            variants={itemVariants}
            className={`${containerClassName} rounded-xl shadow-lg relative overflow-hidden `} // Layout classes here
            style={{ perspective: '1000px' }}
            whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
        >
            <div // This div does the actual flipping, targeted by GSAP
                ref={cardRef}
                className="w-full h-full "
                style={{ transformStyle: 'preserve-3d' }}
            >
                {/* Front Face */}
                <div
                    className={`absolute w-full h-full flex flex-col ${frontFaceStyles}`}
                    style={{ backfaceVisibility: 'hidden' }}
                >
                    <div className="flex items-center mb-3">
                        <Icon className={`h-6 w-6 mr-3 ${iconClassName || 'text-purple-600'}`} />
                        <h3 className={`text-xl font-semibold ${titleClassName || 'text-gray-800'}`}>{title}</h3>
                    </div>
                    <div className={`text-sm flex-grow ${contentClassName || 'text-gray-600'}`}>
                        {children}
                    </div>
                </div>

                {/* Back Face */}
                <div
                    className={`absolute w-full h-full flex flex-col ${backFaceStyles}`}
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                    {backContent}
                </div>
            </div>
        </motion.div>
    );
};

const EngagementBentoGrid = () => {
    const likeReactBackContent = (
        <div className="flex flex-col justify-center items-center h-full text-center">
            <Heart className="h-10 w-10 mx-auto mb-3 text-purple-300" />
            <h4 className="text-lg font-semibold mb-2 text-white">Spread the Love</h4>
            <p className="text-xs text-gray-200">
                Your reactions fuel creators and help great content reach wider audiences. Every like is a virtual high-five!
            </p>
           
        </div>
    );

    const commentsBackContent = (
        <div className="flex flex-col justify-center items-center h-full text-center">
            <MessageCircle className="h-10 w-10 mx-auto mb-3 text-yellow-300" />
            <h4 className="text-lg font-semibold mb-2 text-gray-800">Spark Conversations</h4>
            <p className="text-xs text-gray-600">
                Dive into discussions, offer unique perspectives, and build connections. Your voice adds depth to the Audora experience.
            </p>
           
        </div>
    );

    const communityBackContent = (
        <div className="flex flex-col justify-center items-center h-full text-center">
            <Users2 className="h-10 w-10 mx-auto mb-3 text-purple-300" />
            <h4 className="text-lg font-semibold mb-2 text-white">Find Your Tribe</h4>
            <p className="text-xs text-gray-200">
                Connect with like-minded individuals in Community Circles. Share ideas, collaborate, and grow together around shared passions.
            </p>
            
        </div>
    );

    const evolutionBackContent = (
        <div className="flex flex-col justify-center items-center h-full text-center">
            <TrendingUp className="h-10 w-10 mx-auto mb-3 text-yellow-300" />
            <h4 className="text-lg font-semibold mb-2 text-gray-800">Chart Your Journey</h4>
            <p className="text-xs text-gray-600">
                Discover the impact of your audio. See how your stories resonate, track your reach, and refine your unique voice on Audora.
            </p>
            
        </div>
    );

    return (
        <AnimatedSection id="engagement" className="py-16 sm:py-24 bg-black px-4 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-center mb-12"
            >
                <h2 className="text-3xl font-bold tracking-tight text-yellow-600 sm:text-4xl">
                    Engage & Evolve
                </h2>
                <p className="mt-4 text-lg text-purple-700 max-w-2xl mx-auto">
                    Deepen your connection through interaction, feedback, and community.
                </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                <BentoCard
                    title="Like & React"
                    icon={ThumbsUp}
                    containerClassName="min-h-[220px] md:min-h-[200px]"
                    frontFaceStyles="p-6 bg-purple-100"
                    iconClassName="text-purple-600"
                    titleClassName="text-gray-800"
                    contentClassName="text-gray-600"
                    backContent={likeReactBackContent}
                    backFaceStyles="p-6 bg-purple-600 text-white items-center justify-center"
                >
                    <p>Show love for audio you enjoy. Boost content visibility and support your favorite creators.</p>
                </BentoCard>

                <BentoCard
                    title="Meaningful Comments"
                    icon={MessageSquareText}
                    containerClassName="md:col-span-2 min-h-[220px] md:min-h-[200px]"
                    frontFaceStyles="p-6 bg-white"
                    iconClassName="text-yellow-600"
                    titleClassName="text-gray-800"
                    contentClassName="text-gray-600"
                    backContent={commentsBackContent}
                    backFaceStyles="p-6 bg-yellow-100 text-gray-800 items-center justify-center"
                >
                    <p>Start real conversations, leave feedback, or share your thoughts with creators and listeners alike.</p>
                    <div className="mt-4 text-sm italic text-purple-600">"This changed how I see things..."</div>
                </BentoCard>

                <BentoCard
                    title="Community Circles"
                    icon={Users2}
                    containerClassName="min-h-[220px] md:min-h-[200px]"
                    frontFaceStyles="p-6 bg-purple-100"
                    iconClassName="text-purple-600"
                    titleClassName="text-gray-800"
                    contentClassName="text-gray-600"
                    backContent={communityBackContent}
                    backFaceStyles="p-6 bg-purple-600 text-white items-center justify-center"
                >
                    <p>Join interest-based groups to explore shared passions and collaborate with like-minded listeners.</p>
                </BentoCard>

                <BentoCard
                    title="Your Evolution"
                    icon={Sparkles}
                    containerClassName="md:col-span-2 min-h-[220px] md:min-h-[200px]"
                    frontFaceStyles="p-6 bg-white"
                    iconClassName="text-yellow-600"
                    titleClassName="text-gray-800"
                    contentClassName="text-gray-600"
                    backContent={evolutionBackContent}
                    backFaceStyles="p-6 bg-yellow-100 text-gray-800 items-center justify-center"
                >
                    <p>See how your voice travels. Track listens, reach, and discover your top performing posts.</p>
                    <div className="flex gap-3 mt-4 text-xs text-gray-600">
                        <span className="bg-yellow-200 text-gray-800 py-1 px-2 rounded-full">Trending</span>
                        <span className="bg-purple-200 text-gray-800 py-1 px-2 rounded-full">Top Creator</span>
                    </div>
                </BentoCard>
            </div>
        </AnimatedSection>
    );
};

export default EngagementBentoGrid;