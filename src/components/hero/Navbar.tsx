import React, { useState } from 'react';
import { Plus, Menu, X, ArrowUpRight } from 'lucide-react';

interface NavbarProps {
  onEnterTerminal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onEnterTerminal }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleTerminalClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onEnterTerminal) {
      onEnterTerminal();
    } else {
      const el = document.getElementById('terminal-dashboard');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <nav className="w-full relative z-30 px-6 md:px-12 lg:px-24 pt-6 md:pt-8">
      <div className="w-full flex items-center justify-between">
        {/* Logo Block */}
        <a href="#hero" className="flex flex-col group cursor-pointer focus:outline-none">
          <span className="brand-wordmark font-inter font-semibold text-[1.25rem] lg:text-[1.5rem] text-white tracking-wide leading-none transition-colors group-hover:text-white/90">
            NEWSATLAS
          </span>
          <span className="font-inter uppercase text-[0.6rem] lg:text-[0.75rem] text-white/70 tracking-widest leading-normal mt-0.5">
            GLOBAL INTELLIGENCE
          </span>
        </a>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center space-x-10">
          <a
            href="#terminal-dashboard"
            onClick={handleTerminalClick}
            className="font-inter text-sm text-white/90 hover:text-white/70 transition-colors duration-300 font-medium"
          >
            Live Terminal
          </a>
          <button
            type="button"
            onClick={() => {
              handleTerminalClick({ preventDefault: () => {} } as React.MouseEvent);
              setTimeout(() => {
                if (window.switchTab) window.switchTab('news');
              }, 400);
            }}
            className="font-inter text-sm text-white/90 hover:text-white/70 transition-colors duration-300 font-medium"
          >
            World News
          </button>
          <button
            type="button"
            onClick={() => {
              handleTerminalClick({ preventDefault: () => {} } as React.MouseEvent);
              setTimeout(() => {
                if (window.switchTab) window.switchTab('markets');
              }, 400);
            }}
            className="font-inter text-sm text-white/90 hover:text-white/70 transition-colors duration-300 font-medium"
          >
            Financial Markets
          </button>
          <button
            type="button"
            onClick={() => {
              handleTerminalClick({ preventDefault: () => {} } as React.MouseEvent);
              setTimeout(() => {
                if (window.switchTab) window.switchTab('atmosphere');
              }, 400);
            }}
            className="font-inter text-sm text-white/90 hover:text-white/70 transition-colors duration-300 font-medium"
          >
            Atmosphere
          </button>
        </div>

        {/* Desktop CTA Button */}
        <div className="hidden sm:flex items-center">
          <button
            type="button"
            onClick={handleTerminalClick}
            className="group flex items-center space-x-3 text-white transition-all duration-300 focus:outline-none"
          >
            <span className="font-inter text-sm font-medium tracking-normal text-white group-hover:text-white/90 transition-colors">
              Launch Terminal
            </span>
            <div className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center transition-all duration-300 group-hover:bg-white group-hover:border-white">
              <Plus className="w-4 h-4 text-white transition-colors duration-300 group-hover:text-[#050B14]" />
            </div>
          </button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="lg:hidden flex items-center">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-white/90 hover:text-white focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-4 w-full rounded-2xl bg-[#02122C]/95 border border-white/20 p-6 backdrop-blur-xl flex flex-col space-y-4">
          <a
            href="#terminal-dashboard"
            onClick={(e) => {
              setMobileMenuOpen(false);
              handleTerminalClick(e);
            }}
            className="font-inter text-base text-white/90 hover:text-white font-medium"
          >
            Live Terminal
          </a>
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              handleTerminalClick({ preventDefault: () => {} } as React.MouseEvent);
              setTimeout(() => {
                if (window.switchTab) window.switchTab('news');
              }, 400);
            }}
            className="font-inter text-left text-base text-white/90 hover:text-white font-medium"
          >
            World News
          </button>
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              handleTerminalClick({ preventDefault: () => {} } as React.MouseEvent);
              setTimeout(() => {
                if (window.switchTab) window.switchTab('markets');
              }, 400);
            }}
            className="font-inter text-left text-base text-white/90 hover:text-white font-medium"
          >
            Financial Markets
          </button>
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              handleTerminalClick({ preventDefault: () => {} } as React.MouseEvent);
              setTimeout(() => {
                if (window.switchTab) window.switchTab('atmosphere');
              }, 400);
            }}
            className="font-inter text-left text-base text-white/90 hover:text-white font-medium"
          >
            Atmosphere
          </button>
          <div className="pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={(e) => {
                setMobileMenuOpen(false);
                handleTerminalClick(e);
              }}
              className="w-full flex items-center justify-between py-2 text-white font-medium"
            >
              <span>Launch Terminal</span>
              <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4 text-[#050B14]" />
              </div>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};
