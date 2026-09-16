'use client';
import { useTheme } from '@/components/ThemeProvider';
import LandingNavbar from '@/components/landing/LandingNavbar';
import HeroSection from '@/components/landing/HeroSection';
import InteractiveSimulator from '@/components/landing/InteractiveSimulator';
import BentoFeatures from '@/components/landing/BentoFeatures';
import WorkflowSection from '@/components/landing/WorkflowSection';
import MetricsSection from '@/components/landing/MetricsSection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import FaqSection from '@/components/landing/FaqSection';
import CtaBanner from '@/components/landing/CtaBanner';
import LandingFooter from '@/components/landing/LandingFooter';
import './landing.css';

export default function LandingPage() {
  const { theme } = useTheme();

  return (
    <div className={`landing-wrapper ${theme === 'dark' ? 'dark' : 'light'}`}>
      {/* Background Grid Mesh */}
      <div className="landing-grid-bg" />

      {/* Floating Glowing Aurora Mesh Orbs */}
      <div className="aurora-orb aurora-orb-1" />
      <div className="aurora-orb aurora-orb-2" />
      <div className="aurora-orb aurora-orb-3" />

      {/* Sticky Glassmorphic Navbar with Theme Switcher & Logo */}
      <LandingNavbar />

      {/* Hero Section with Live Stats & Badges */}
      <HeroSection />

      {/* Interactive Live Playground / Simulator */}
      <InteractiveSimulator />

      {/* Metrics & Proof Counter */}
      <MetricsSection />

      {/* Bento Grid Feature Spotlight */}
      <BentoFeatures />

      {/* 3-Step Guided Roadmap */}
      <WorkflowSection />

      {/* Student & Developer Testimonials */}
      <TestimonialsSection />

      {/* Interactive Expandable FAQ Accordion */}
      <FaqSection />

      {/* Conversion Banner */}
      <CtaBanner />

      {/* Comprehensive SaaS Footer */}
      <LandingFooter />
    </div>
  );
}
