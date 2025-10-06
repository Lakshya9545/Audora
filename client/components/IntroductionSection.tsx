'use client';

import { useRef, useEffect } from 'react';
import { Volume2, MessageSquare, Headphones } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

// Simple Sound Wave SVG component
const SoundWave = () => (
    <svg viewBox="0 0 100 50" className="w-full h-16 text-mutedGold mx-auto mt-12 mb-8 sound-wave">
        <path d="M 0 25 Q 5 10, 10 25 T 20 25 Q 25 40, 30 25 T 40 25 Q 45 10, 50 25 T 60 25 Q 65 40, 70 25 T 80 25 Q 85 10, 90 25 T 100 25" stroke="currentColor" fill="none" strokeWidth="2" />
    </svg>
);

const IntroductionSection = () => {
    const sectionRef = useRef<HTMLElement>(null);
    const headingRef = useRef<HTMLHeadingElement>(null);
    const subHeadingRef = useRef<HTMLParagraphElement>(null);
    const textRef = useRef<HTMLParagraphElement>(null);
    const iconContainerRef = useRef<HTMLDivElement>(null);
    const soundWaveRef = useRef<SVGSVGElement>(null); // Ref for the sound wave

    useEffect(() => {
        if (!sectionRef.current || !iconContainerRef.current || !headingRef.current || !subHeadingRef.current || !textRef.current || !soundWaveRef.current) {
            return;
        }

        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top 75%", // Start a bit earlier
                    end: "bottom 60%",
                    toggleActions: "play none none none",
                    // markers: true,
                },
                defaults: { ease: 'power3.out' } // Slightly different ease
            });

            // Animate icons
            if (iconContainerRef.current?.children) {
                tl.from(iconContainerRef.current.children, {
                    opacity: 0,
                    scale: 0.5,
                    y: -20,
                    stagger: 0.15,
                    duration: 0.5
                });
            }
            // Animate text elements
            tl.from(headingRef.current, { opacity: 0, y: 40, duration: 0.7 }, "-=0.3")
              .from(subHeadingRef.current, { opacity: 0, y: 30, duration: 0.6 }, "-=0.5")
              .from(textRef.current, { opacity: 0, y: 25, duration: 0.6 }, "-=0.4")
              // Animate sound wave
              .from(soundWaveRef.current, { opacity: 0, scaleY: 0, duration: 0.8, ease: 'elastic.out(1, 0.5)' }, "-=0.3");


    

        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        // Add class for animated background
        <section ref={sectionRef} className="relative py-24 sm:py-32 bg-creamyTan px-4 sm:px-6 lg:px-8 text-center overflow-hidden animated-gradient-bg">
            {/* Background pseudo-element will be styled in CSS */}
            <div className="relative z-10 max-w-4xl mx-auto"> {/* Ensure content is above background */}
                <div ref={iconContainerRef} className="flex justify-center space-x-6 mb-10">
                    {/* Add hover effect classes */}
                    <Volume2 size={48} className="text-richPurple icon-hover-effect" />
                    <Headphones size={48} className="text-mutedGold icon-hover-effect" />
                    <MessageSquare size={48} className="text-richPurple icon-hover-effect" />
                </div>
                <h2 ref={headingRef} className="text-4xl font-extrabold tracking-tight text-darkGray sm:text-5xl lg:text-6xl mb-5">
                    What is <span className="text-richPurple">Audora</span>?
                </h2>
                <p ref={subHeadingRef} className="mt-4 text-xl text-darkSlate max-w-3xl mx-auto">
                    Sound Off. Be Heard.
                </p>

                {/* Use the SoundWave component */}
                <div ref={soundWaveRef as any}> {/* Cast ref type for SVG */} 
                    <SoundWave />
                </div>

                <p ref={textRef} className="mt-6 text-lg text-darkSlate max-w-2xl mx-auto leading-relaxed">
                    Tired of endless visual feeds? Audora offers a refreshing social experience centered entirely around **audio**. It's your space to share your unique voice, discover diverse perspectives through authentic conversations, and connect meaningfully using the simple, powerful medium of sound. Move beyond the scroll and tune into the stories and discussions that matter.
                </p>
            </div>
        </section>
    );
};

export default IntroductionSection;