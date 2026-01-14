import React from 'react';
import { motion } from 'framer-motion';

const Intro = () => {
  // Smooth scroll helper
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative overflow-hidden">
      <main className="max-w-7xl mx-auto px-6 pt-40 pb-20">
        
        {/* --- HERO SECTION --- */}
        <section className="relative text-center mb-24">
          <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-blue-500/10 blur-[140px] rounded-full -z-10" />
          
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/5 border border-white/10 mb-8"
          >
            <span className="text-[10px] font-bold text-blue-500 uppercase tracking-[0.3em]">AI-Powered Behavioral Intelligence</span>
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-black tracking-tighter text-white mb-8 leading-[0.9]"
          >
            PREDICTIVE <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-600">
              CROWD SAFETY
            </span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xl text-slate-400 max-w-3xl mx-auto mb-12 leading-relaxed font-light"
          >
            Eliminating blind spots in high-density environments. Our neural networks analyze 
            <strong> spatial dynamics</strong> and <strong>motion vectors</strong> in real-time to prevent 
            incidents before they occur.
          </motion.p>

          <div className="flex flex-wrap justify-center gap-4">
            {/* Action 1: Scroll to Detection App Section */}
            <button 
              onClick={() => scrollToSection('detection-app')}
              className="px-10 py-4 bg-white text-black font-bold rounded-2xl transition-all hover:bg-blue-50 hover:scale-105 active:scale-95 uppercase tracking-widest text-[10px] cursor-pointer"
            >
              Initialize Live Feed
            </button>

            {/* Action 2: Scroll to Feature Cards below */}
            <button 
              onClick={() => scrollToSection('core-features')}
              className="px-10 py-4 bg-slate-900/50 backdrop-blur-md border border-white/10 text-white font-bold rounded-2xl transition-all hover:bg-slate-800 hover:scale-105 active:scale-95 uppercase tracking-widest text-[10px] cursor-pointer"
            >
              Core Technology
            </button>
          </div>
        </section>

        {/* --- STATS BAR --- */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20 py-8 border-y border-white/5 bg-white/[0.02] backdrop-blur-sm"
        >
          {[
            { label: 'Latency', value: '< 30ms' },
            { label: 'Accuracy', value: '98.2%' },
            { label: 'Architecture', value: 'YOLOv8' },
            { label: 'Processing', value: 'Real-Time' }
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">{stat.label}</p>
              <p className="text-xl font-mono font-bold text-blue-400">{stat.value}</p>
            </div>
          ))}
        </motion.div>

        {/* --- CORE CAPABILITIES SECTION (With ID for scrolling) --- */}
        <div id="core-features" className="grid grid-cols-1 md:grid-cols-3 gap-8 scroll-mt-32">
          <FeatureCard 
            title="Anomaly Detection" 
            desc="Identify irregular movement patterns and potential stampede triggers using advanced optical flow." 
          />
          <FeatureCard 
            title="Density Mapping" 
            desc="High-fidelity occupancy tracking to maintain safe threshold limits in complex architectural spaces." 
          />
          <FeatureCard 
            title="Automated Alerts" 
            desc="Instant neural-trigger notifications when crowd dynamics exceed safety parameters." 
          />
        </div>
      </main>
    </div>
  );
};

const FeatureCard = ({ title, desc }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="p-8 rounded-[2rem] bg-gradient-to-b from-slate-900/50 to-slate-900/20 border border-white/5 hover:border-blue-500/20 transition-all"
  >
    <h3 className="text-white font-bold uppercase tracking-tight mb-4">{title}</h3>
    <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
  </motion.div>
);

export default Intro;