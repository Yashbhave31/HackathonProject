import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faVideo, faUsers, faBiohazard } from "@fortawesome/free-solid-svg-icons";

/**
 * LiveDetection Component
 * Interface for real-time camera stream processing and neural telemetry.
 */
const LiveDetection = (props) => {
  const [isLive, setIsLive] = useState(false);
  const [risk, setRisk] = useState("IDLE");
  const [peopleCount, setPeopleCount] = useState(0);
  const [motion, setMotion] = useState("IDLE");

  const pollRef = useRef(null);

  /**
   * Initializes polling to sync frontend state with backend AI metrics.
   * Frequency: 1000ms
   */
  const startPolling = () => {
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch("http://127.0.0.1:5000/live_progress");
        const data = await res.json();
        
        // Update local state with real-time inference data
        setRisk(data.risk);
        setPeopleCount(data.people_count);
        setMotion(data.motion);
      } catch (err) {
        console.error("Telemetry sync error: Live poll failed");
      }
    }, 1000);
  };

  /**
   * Manages the lifecycle of the MJPEG stream and background worker threads.
   */
  const handleToggle = async () => {
    if (isLive) {
      // Termination Logic: Stop polling, signal backend to release hardware
      setIsLive(false);
      props.setStatus(false);
      clearInterval(pollRef.current);
      await fetch("http://127.0.0.1:5000/stop_live");
    } else {
      // Initialization Logic: Trigger camera hardware and start data polling
      setIsLive(true);
      props.setStatus(true);
      startPolling();
    }
  };

  // Ensure polling is cleared if component unmounts unexpectedly
  useEffect(() => {
    return () => clearInterval(pollRef.current);
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-5 bg-slate-900/40 backdrop-blur-md rounded-3xl border border-white/5 shadow-2xl">
      {/* Control Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-black text-white uppercase tracking-tighter">Live Neural Node</h2>
        <button 
          onClick={handleToggle} 
          className={`px-8 py-2 rounded-xl font-bold text-xs transition-all ${
            isLive 
            ? 'bg-red-500/10 text-red-500 border border-red-500/50 hover:bg-red-500/20' 
            : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/20'
          }`}
        >
          {isLive ? "TERMINATE" : "INITIALIZE LIVE"}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Stream Viewport */}
        <div className="flex-grow aspect-video bg-black/40 rounded-2xl overflow-hidden border border-white/5">
          {isLive ? (
            <img 
              src="http://127.0.0.1:5000/video_feed" 
              className="w-full h-full object-cover" 
              alt="Real-time AI Feed" 
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-700 uppercase font-mono text-xs">
              <FontAwesomeIcon icon={faVideo} className="mb-4 text-3xl opacity-20" />
              Stream Offline
            </div>
          )}
        </div>

        {/* Telemetry Sidebar */}
        <div className="w-full lg:w-80 flex flex-col gap-4">
          <FeatureCard 
            icon={faBiohazard} 
            title="System Risk" 
            content={risk} 
            color={risk === "HIGH" ? "text-red-500" : "text-blue-400"} 
            desc="Real-time behavior scoring" 
          />
          <FeatureCard 
            icon={faUsers} 
            title="Subject Count" 
            content={peopleCount} 
            color="text-white" 
            desc="Human entities in frame" 
          />
          
          {/* Motion Status Indicator */}
          <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-2xl">
              <p className="text-[10px] text-blue-500 font-bold uppercase mb-1 tracking-widest">Signal Status</p>
              <p className="text-lg font-black text-blue-400 italic">{motion}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Reusable Metric Card for high-density data display
 */
const FeatureCard = ({ icon, title, content, color, desc }) => (
    <div className="p-6 bg-slate-950/60 border border-white/5 rounded-2xl">
        <div className="flex items-center gap-2 mb-2">
            <FontAwesomeIcon icon={icon} className="text-slate-600" size="xs" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{title}</span>
        </div>
        <div className={`text-2xl font-black ${color}`}>{content}</div>
        <p className="text-[10px] text-slate-600 mt-1">{desc}</p>
    </div>
);

export default LiveDetection;
