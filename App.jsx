import React, { useState } from 'react';
import Navbar from './Components/Navbar';
import Intro from './Components/Intro';
import VideoUpload from './Components/VideoUpload';
import LiveDetection from './Components/LiveDetection';
import AnalyticsDashboard from './Components/AnalyticsDashboard';
import Footer from './Components/Footer';
import Bganimation from './Components/Bganimation'; 
import { motion, AnimatePresence } from 'framer-motion';

const App = () => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [activeMode, setActiveMode] = useState('live'); 

  const switchMode = (mode) => {
    console.log("Switching to:", mode);
    setActiveMode(mode);
    setIsDetecting(false); 
  };

  return (
    <div className='relative min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-blue-500/30 overflow-x-hidden'>
      
      {/* 1. INTERACTIVE BACKGROUND */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Bganimation />
      </div>

      {/* 2. CONTENT LAYER */}
      <div id="home" className="relative z-10">
        <Navbar isDetecting={isDetecting} />
        
        <div className="backdrop-blur-[2px]">
          <Intro />
        </div>

        {/* --- ADDED SPACING AND INSTRUCTIONAL TEXT --- */}
        <div className="mt-15 mb-12 text-center"> 
          <h3 className="text-2xl text-white/80 tracking-wide font-bold">
            Select a <span className="text-blue-500 font-bold">Monitoring Gateway</span> to begin analysis
          </h3>
        </div>

        {/* MODE SWITCHER */}
        <div id="detection-app" className="relative z-50 flex justify-center gap-4 mb-16">
          <button 
            onClick={() => switchMode('live')}
            className={`cursor-pointer px-8 py-3 rounded-2xl font-bold transition-all duration-300 border ${
              activeMode === 'live' 
              ? 'bg-blue-600 border-blue-400 shadow-[0_0_25px_rgba(37,99,235,0.5)] scale-105' 
              : 'bg-slate-900/80 border-white/5 hover:bg-slate-800 text-slate-400'
            }`}
          >
            Live Feed
          </button>
          <button 
            onClick={() => switchMode('video')}
            className={`cursor-pointer px-8 py-3 rounded-2xl font-bold transition-all duration-300 border ${
              activeMode === 'video' 
              ? 'bg-blue-600 border-blue-400 shadow-[0_0_25px_rgba(37,99,235,0.5)] scale-105' 
              : 'bg-slate-900/80 border-white/5 hover:bg-slate-800 text-slate-400'
            }`}
          >
            Video Analytics
          </button>
        </div>

        {/* MAIN INTERFACE CONTAINER */}
        <div className="container mx-auto px-4 space-y-12 relative z-10">
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeMode} 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="bg-slate-900/40 rounded-[32px] backdrop-blur-xl border border-white/10 p-6 shadow-2xl"
            >
              {activeMode === 'video' ? (
                <VideoUpload setStatus={setIsDetecting} /> 
              ) : (
                <LiveDetection setStatus={setIsDetecting} />
              )}
            </motion.div>
          </AnimatePresence>
          
          <AnalyticsDashboard 
            mode={activeMode} 
            isActive={isDetecting} 
          />
        </div>

        <div id="contact-section" className="h-40" />
        <Footer />
      </div>
    </div>
  );
};

export default App;