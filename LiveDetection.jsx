import React, { useState, useRef, useEffect } from "react";

const FeatureCard = ({ icon, title, content, desc, color }) => (
  <div className="p-6 bg-slate-950/60 border border-white/5 rounded-2xl">
    <div className="flex gap-3 mb-2">
      <span>{icon}</span>
      <h4 className="text-xs text-slate-400 uppercase tracking-wider">{title}</h4>
    </div>
    <div className={`text-2xl font-black ${color} transition-all duration-500`}>
      {content}
    </div>
    <p className="text-[11px] text-slate-600 mt-1">{desc}</p>
  </div>
);

// 🔹 Added 'props' here to receive the trigger from App.jsx
const LiveDetection = (props) => {
  const [isLive, setIsLive] = useState(false);
  const [risk, setRisk] = useState("Idle");
  const [peopleCount, setPeopleCount] = useState(0);
  const [speed, setSpeed] = useState(0);

  const pollRef = useRef(null);

  const startPolling = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch("http://127.0.0.1:5000/live_progress");
        const data = await res.json();
        
        setRisk(data.risk);
        setPeopleCount(data.people_count);
        setSpeed(data.motion === "ACTIVE" ? "Detecting" : "Static"); 
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 1000);
  };

  const handleStartLive = () => {
    setIsLive(true);
    
    // 🚨 SIGNAL TO APP/CHART: Turn on the chart
    if (props.setStatus) props.setStatus(true);
    
    startPolling();
  };

  const handleStopLive = async () => {
    setIsLive(false);
    
    // 🚨 SIGNAL TO APP/CHART: Turn off the chart
    if (props.setStatus) props.setStatus(false);

    if (pollRef.current) clearInterval(pollRef.current);
    try {
        await fetch("http://127.0.0.1:5000/stop_live");
    } catch (e) { console.log("Stop fetch error:", e); }
    
    setRisk("Idle");
    setPeopleCount(0);
    setSpeed(0);
  };

  useEffect(() => {
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto mt-10 px-6 py-5 bg-slate-900/40 backdrop-blur-md rounded-3xl border border-white/5 shadow-2xl">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            {isLive && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>}
            <span className={`relative inline-flex rounded-full h-3 w-3 ${isLive ? 'bg-red-500' : 'bg-slate-500'}`}></span>
          </span>
          Live Intelligence Feed
        </h2>
        
        <button 
          onClick={isLive ? handleStopLive : handleStartLive}
          className={`px-6 py-2 text-xs font-bold rounded-xl transition-all ${
            isLive ? "bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30" : "bg-blue-600 text-white hover:bg-blue-500"
          }`}
        >
          {isLive ? "STOP SURVEILLANCE" : "START LIVE CAMERA"}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* VIDEO PANEL */}
        <div className="flex-grow max-w-4xl aspect-video rounded-2xl overflow-hidden border border-white/10 bg-black/20 relative">
          {!isLive ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-500">
              <div className="text-5xl mb-4">📷</div>
              <p className="text-xl">Camera Offline</p>
              <p className="text-sm">Click 'Start' to begin real-time analysis</p>
            </div>
          ) : (
            <img 
              src="http://127.0.0.1:5000/video_feed" 
              className="w-full h-full object-cover" 
              alt="Live Stream"
            />
          )}
        </div>

        {/* ANALYTICS PANEL */}
        <div className="w-full lg:w-80 flex flex-col gap-4">
          <FeatureCard 
            icon="⚠️" 
            title="Risk Factor" 
            content={risk} 
            color={risk === "HIGH" ? "text-red-500" : risk === "MEDIUM" ? "text-yellow-400" : "text-green-400"} 
            desc="Combined density & motion risk" 
          />
          <FeatureCard 
            icon="👥" 
            title="Live Count" 
            content={peopleCount} 
            color="text-blue-400" 
            desc="Active person detection" 
          />
          <FeatureCard 
            icon="⚡" 
            title="Motion Speed" 
            content={speed} 
            color="text-purple-400" 
            desc="Farneback Optical Flow magnitude" 
          />
        </div>
      </div>
    </div>
  );
};

export default LiveDetection;