import HeroSection from '@/components/HeroSection';
import FeaturesBentoGrid from '@/components/FeaturesBentoGrid';
import CallToActionSection from '@/components/CallToActionSection';
import Header from '@/components/Header'; // Include Header here if specific to homepage layout
import Footer from '@/components/Footer';
import IntroductionSection from '@/components/IntroductionSection';
import EngagementBentoGrid from '@/components/EngagementBentoGrid';

export default function Home() {
  return (
    <>
      {/* If Header is specific to this page layout, place it here */}
      <Header />
      <HeroSection />
      {/* Optional Introduction Section would go here */}
      <IntroductionSection/>
      <FeaturesBentoGrid />
      {/* Optional EngagementBentoGrid Section would go here */}
      <EngagementBentoGrid /> 
      {/* Optional Audio Player Showcase Section would go here */}
      <CallToActionSection />
      <Footer />

    </>
  );
}