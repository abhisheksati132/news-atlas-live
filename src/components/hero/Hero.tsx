import React from 'react';
import { Navbar } from './Navbar';
import { HeroContent } from './HeroContent';

interface HeroProps {
  onEnterTerminal?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onEnterTerminal }) => {
  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      className="relative isolate w-full min-h-[100dvh] overflow-hidden bg-[#050B14] flex flex-col justify-between"
    >
      {/* 1. Background Video Layer */}
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover z-0"
        src="https://strvid.nyc3.cdn.digitaloceanspaces.com/motionsite/hero_cloud_animation_video.mp4"
      />

      {/* 2. Video Dimming Overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-[1]"
        style={{
          background:
            'linear-gradient(90deg, rgba(5, 11, 20, 0.94) 0%, rgba(5, 11, 20, 0.78) 42%, rgba(5, 11, 20, 0.26) 100%), linear-gradient(180deg, rgba(5, 11, 20, 0.25), rgba(5, 11, 20, 0.82))',
        }}
      />

      {/* 3. Foreground Image Layer */}
      <div
        className="absolute bottom-0 w-full h-[80vh] bg-cover bg-bottom pointer-events-none z-[2]"
        style={{
          backgroundImage: 'url("https://strvid.nyc3.cdn.digitaloceanspaces.com/motionsite/hero_foreground_bg.png")',
        }}
      />

      {/* 4. Bottom Vignette */}
      <div className="absolute bottom-0 w-full h-[42vh] bg-gradient-to-t from-[#050B14] via-[#050B14]/70 to-transparent pointer-events-none z-[3]" />

      {/* 5. Top Vignette */}
      <div
        className="absolute inset-0 pointer-events-none z-[3]"
        style={{
          background: 'linear-gradient(to bottom, #050B14 0%, rgba(5, 11, 20, 0.82) 14%, transparent 44%)',
        }}
      />

      {/* 6. UI Content Layer */}
      <div className="relative z-10 flex flex-col min-h-[100dvh] justify-between pb-8 md:pb-10">
        <Navbar onEnterTerminal={onEnterTerminal} />
        <HeroContent onExplore={onEnterTerminal} />
        <div aria-hidden="true" className="h-2" />
      </div>
    </section>
  );
};

export default Hero;
