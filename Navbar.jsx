import React from 'react';
import { motion } from 'framer-motion';

const Navbar = ({ isDetecting, setActiveMode }) => {
  
  const scrollToSection = (id) => {
    if (id === 'home') {
      // If clicking Home, reset to Live Feed and scroll top
      if (setActiveMode) setActiveMode('live');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] px-6 py-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between px-8 py-3 rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-xl shadow-2xl">
          
          {/* --- LOGO SECTION --- */}
          <div 
            className="flex items-center gap-3 cursor-pointer group" 
            onClick={() => scrollToSection('home')}
          >
              <img
                src="/PublicDetectionweblogo.png"
                alt="CrowdGuardian"
                className="h-10 w-10 rounded-lg group-hover:scale-105 transition-transform"
              />
            <h1 className="text-lg font-bold tracking-tighter hidden sm:block">
              <span className="text-white uppercase">Crowd</span>
              <span className="text-blue-500 uppercase">Guardian</span>
            </h1>
          </div>

          {/* --- NAVIGATION LINKS --- */}
          <div className="flex items-center gap-6 sm:gap-10">
            <button
              onClick={() => scrollToSection('home')}
              className="relative text-xs font-bold text-slate-400 hover:text-white transition-all uppercase tracking-[0.2em] group"
            >
              Home
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 transition-all duration-300 group-hover:w-full" />
            </button>

            <button
              onClick={() => scrollToSection('about-section')}
              className="relative text-xs font-bold text-slate-400 hover:text-white transition-all uppercase tracking-[0.2em] group"
            >
              About Us
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 transition-all duration-300 group-hover:w-full" />
            </button>

            <button
              onClick={() => scrollToSection('contact-section')}
              className="relative text-xs font-bold text-slate-400 hover:text-white transition-all uppercase tracking-[0.2em] group"
            >
              Contact
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 transition-all duration-300 group-hover:w-full" />
            </button>
          </div>

          {/* --- SYSTEM STATUS LOGO --- */}
          <div className="hidden sm:flex items-center gap-4 pl-6 border-l border-white/10">
            <div className="flex flex-col items-end">
                <span className={`text-[9px] font-black uppercase tracking-tighter ${isDetecting ? 'text-green-400' : 'text-blue-500'}`}>
                    {isDetecting ? 'Scan_Active' : 'System_Ready'}
                </span>
                <span className="text-[8px] text-slate-600 font-mono">SECURE_NODE</span>
            </div>
            {/* Pulsing Status Icon */}
            <div className="relative flex items-center justify-center">
              {isDetecting && (
                <span className="animate-ping absolute h-4 w-4 rounded-full bg-green-400 opacity-20" />
              )}
              <div className={`h-2.5 w-2.5 rounded-full shadow-lg transition-colors duration-500 ${isDetecting ? 'bg-green-500' : 'bg-blue-600'}`} />
            </div>
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;