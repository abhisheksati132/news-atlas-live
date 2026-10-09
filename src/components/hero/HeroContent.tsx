import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface HeroContentProps {
  onExplore?: () => void;
}

export const HeroContent: React.FC<HeroContentProps> = ({ onExplore }) => {
  const handleScrollToTerminal = () => {
    if (onExplore) {
      onExplore();
    } else {
      const el = document.getElementById('terminal-dashboard');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="flex-grow flex flex-col items-center justify-center text-center px-6 mt-12 lg:mt-20 max-w-4xl mx-auto z-10">
      {/* Subtitle */}
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="font-inter font-medium uppercase text-white/70 text-[0.75rem] md:text-[0.875rem] tracking-widest mb-4 md:mb-6"
      >
        WE TRACK THE WORLD IN REAL-TIME
      </motion.p>

      {/* Main Headline (H1) */}
      <motion.h1
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
        className="font-inter font-bold text-white text-[3rem] md:text-[4.5rem] lg:text-[5.5rem] leading-[1.1] tracking-tight mb-6"
      >
        The Living Earth, <br className="hidden md:block" />
        In Real-Time Data.
      </motion.h1>

      {/* Description */}
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
        className="font-inter font-normal text-white/80 text-[1rem] md:text-[1.125rem] leading-[1.625] max-w-2xl mb-8 md:mb-10"
      >
        Planetary situational awareness unifying sovereign market telemetry, geopolitical breaking news, World Bank economics, and Doppler atmospheric intelligence.
      </motion.p>

      {/* Pill CTA Button */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
      >
        <button
          type="button"
          onClick={handleScrollToTerminal}
          className="group relative inline-flex items-center rounded-full border border-white/20 bg-transparent backdrop-blur-sm pl-6 pr-2 py-2 transition-all duration-300 hover:bg-white/5 hover:border-white/40 focus:outline-none"
        >
          <span className="font-inter text-sm md:text-base font-medium text-white mr-4 transition-colors">
            Explore Live Terminal
          </span>
          <div className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center transition-all duration-300 group-hover:bg-white group-hover:border-white">
            <ArrowRight className="w-4 h-4 text-white transition-colors duration-300 group-hover:text-[#050B14]" />
          </div>
        </button>
      </motion.div>
    </div>
  );
};
