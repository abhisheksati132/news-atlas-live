import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface HeroContentProps {
  onExplore?: () => void;
}

export const HeroContent: React.FC<HeroContentProps> = ({ onExplore }) => {
  const prefersReducedMotion = useReducedMotion();
  const entrance = (distance: number, delay = 0) => ({
    initial: prefersReducedMotion ? false : { y: distance, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: prefersReducedMotion
      ? { duration: 0 }
      : { duration: 0.8, ease: 'easeOut', delay },
  });

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
    <div className="flex-grow flex items-center px-6 md:px-12 lg:px-24 py-16 md:py-20 z-10">
      <div className="max-w-2xl text-left">
      <motion.p
        {...entrance(20)}
        className="font-mono font-medium text-amber-300/90 text-[0.7rem] md:text-xs tracking-[0.16em] mb-5"
      >
        NEWSATLAS / WORLD VIEW
      </motion.p>

      <motion.h1
        id="hero-heading"
        {...entrance(30, 0.1)}
        className="font-display font-semibold text-white text-[3.25rem] md:text-[4.5rem] lg:text-[5.25rem] leading-[0.98] tracking-[-0.055em] mb-6 max-w-3xl"
      >
        See what changed,{' '}
        <br className="hidden md:block" />
        <span className="text-amber-300">anywhere on Earth.</span>
      </motion.h1>

      <motion.p
        {...entrance(20, 0.2)}
        className="font-inter font-normal text-white/72 text-base md:text-lg leading-[1.55] max-w-xl mb-8"
      >
        News, markets, weather, and context for the country you are watching.
      </motion.p>

      <motion.div
        {...entrance(20, 0.3)}
      >
        <button
          type="button"
          onClick={handleScrollToTerminal}
          className="group inline-flex min-h-12 items-center rounded-lg bg-amber-300 px-5 py-3 text-[#111827] transition-colors duration-200 hover:bg-amber-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050B14]"
          aria-label="Open the NewsAtlas live terminal"
        >
          <span className="font-inter text-sm md:text-base font-semibold mr-3">
            Open the live view
          </span>
          <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </button>
      </motion.div>
      </div>
    </div>
  );
};
