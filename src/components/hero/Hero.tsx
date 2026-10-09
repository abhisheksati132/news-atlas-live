import React from 'react';
import { Navbar } from './Navbar';
import { HeroContent } from './HeroContent';

interface HeroProps {
  onEnterTerminal?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onEnterTerminal }) => {
  return (
    <section id="hero" className="relative w-full min-h-screen overflow-hidden bg-[#050B14] flex flex-col justify-between">
      {/* 1. Background Video Layer */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
        src="https://strvid.nyc3.cdn.digitaloceanspaces.com/motionsite/hero_cloud_animation_video.mp4"
      />

      {/* 2. Video Dimming Overlay */}
      <div className="absolute inset-0 bg-black/20 pointer-events-none z-[1]" />

      {/* 3. Foreground Image Layer */}
      <div
        className="absolute bottom-0 w-full h-[80vh] bg-cover bg-bottom pointer-events-none z-[2]"
        style={{
          backgroundImage: 'url("https://strvid.nyc3.cdn.digitaloceanspaces.com/motionsite/hero_foreground_bg.png")',
        }}
      />

      {/* 4. Bottom Vignette */}
      <div className="absolute bottom-0 w-full h-[60vh] bg-gradient-to-t from-[#02122c] via-[#02122c]/80 to-transparent pointer-events-none z-[3]" />

      {/* 5. Top Vignette */}
      <div
        className="absolute inset-0 pointer-events-none z-[3]"
        style={{
          background: 'linear-gradient(to bottom, #02122cff 0%, #02122cfa 10%, #02122c80 25%, transparent 50%)',
        }}
      />

      {/* 6. UI Content Layer */}
      <div className="relative z-10 flex flex-col min-h-screen justify-between pb-12">
        <Navbar onEnterTerminal={onEnterTerminal} />
        <HeroContent onExplore={onEnterTerminal} />

        {/* Minimal Scroll Indicator */}
        <div className="flex flex-col items-center justify-center text-white/50 text-xs font-inter z-10">
          <div className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center p-1 mb-2">
            <div className="w-1 h-2 rounded-full bg-white/70 animate-bounce" />
          </div>
          <span className="uppercase text-[10px] tracking-widest text-white/40">Scroll to Explore</span>
        </div>
      </div>
    </section>
  );
};

export default Hero;
