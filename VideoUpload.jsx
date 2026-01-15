import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTriangleExclamation,
  faPersonRunning,
  faStop
} from "@fortawesome/free-solid-svg-icons";

/**
 * VideoUpload Component
 * Facilitates asynchronous video file uploads and manages the lifecycle 
 * of background AI processing telemetry.
 */
const VideoUpload = (props) => {
  const [status, setStatus] = useState("idle");
  const [videoSrc, setVideoSrc] = useState(null);
  const [risk, setRisk] = useState("Waiting...");
  const [peopleCount, setPeopleCount] = useState(0);

  const fileInputRef = useRef(null);
  const pollRef = useRef(null);

  /**
   * Orchestrates high-frequency polling to synchronize UI with 
   * server-side computer vision progress.
   */
  const startPolling = () => {
    // Prevent multiple concurrent polling intervals
    if (pollRef.current) clearInterval(pollRef.current);
    
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch("http://127.0.0.1:5000/progress");
        const data = await res.json();

        // Update real-time risk metrics
        setRisk(data.risk);
        setPeopleCount(data.people_count);

        // Auto-terminate polling upon completion signal from engine
        if (data.status === "Done") {
          handleStop();
          setStatus("completed");
        }
      } catch (err) {
        console.error("Telemetry sync error:", err);
      }
    }, 1500);
  };

  /**
   * Handles binary file selection, generates local preview, 
   * and dispatches the multipart/form-data request to the API.
   */
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("video/")) return;

    // Local object URL for immediate UI feedback
    setVideoSrc(URL.createObjectURL(file));
    setStatus("processing");

    // Signal parent application to activate global analytics dashboard
    if (props.setStatus) props.setStatus(true);

    const formData = new FormData();
    formData.append("video", file);

    try {
      await fetch("http://127.0.0.1:5000/upload-video", {
        method: "POST",
        body: formData,
      });
      startPolling();
    } catch (err) {
      console.error("Upload failed:", err);
      handleStop();
    }
  };

  /**
   * Resets component lifecycle state and clears active intervals.
   */
  const handleStop = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = null;
    
    setStatus("idle");
    setVideoSrc(null);
    setRisk("Waiting...");
    setPeopleCount(0);
    
    // Deactivate global analytics state
    if (props.setStatus) props.setStatus(false);
  };

  // Cleanup effect to ensure no memory leaks from background polling
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-5 bg-slate-900/40 backdrop-blur-md rounded-3xl border border-white/5 shadow-2xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-white tracking-tight">
          {status === "idle" ? "Upload Surveillance Feed" : "Intelligence Feed Analysis"}
        </h2>
        
        {/* Process Control Action */}
        {status !== "idle" && (
          <button 
            onClick={handleStop}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 rounded-xl transition-all font-bold text-xs uppercase tracking-widest"
          >
            <FontAwesomeIcon icon={faStop} />
            Terminate Process
          </button>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Media Viewport */}
        <div className="flex-grow max-w-4xl aspect-video rounded-2xl overflow-hidden border border-white/10 bg-black/20">
          {status === "idle" ? (
            <div 
              onClick={() => fileInputRef.current.click()} 
              className="group w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-all"
            >
              <input type="file" hidden ref={fileInputRef} accept="video/*" onChange={handleFileUpload} />
              <div className="text-5xl mb-4 opacity-20 group-hover:scale-110 group-hover:opacity-40 transition-all">📁</div>
              <p className="text-white text-xl font-medium">Initialize Media Gateway</p>
              <p className="text-slate-500 text-sm mt-1">Supported Formats: MP4, AVI, MKV</p>
            </div>
          ) : (
            <video src={videoSrc} className="w-full h-full object-cover" autoPlay muted loop />
          )}
        </div>

        {/* Inference Sidebar */}
        <div className="w-full lg:w-80 flex flex-col gap-4">
          <FeatureCard 
            icon={faTriangleExclamation} 
            title="Risk Factor" 
            content={risk} 
            desc="Crowd density & threat analysis" 
            color={risk === "HIGH" ? "text-red-500" : "text-green-400"} 
          />
          <FeatureCard 
            icon={faPersonRunning} 
            title="Neural Status" 
            content={status === "processing" ? "ACTIVE" : "IDLE"} 
            color={status === "processing" ? "text-green-400" : "text-slate-400"} 
            desc="AI engine compute status" 
          />
        </div>
      </div>
    </div>
  );
};

/**
 * Reusable Metric Component for system telemetry visualization
 */
const FeatureCard = ({ icon, title, content, desc, color }) => (
  <div className="p-6 bg-slate-950/60 border border-white/5 rounded-2xl">
    <div className="flex gap-3 mb-2 items-center">
      <FontAwesomeIcon icon={icon} className="text-slate-500" size="sm" />
      <h4 className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{title}</h4>
    </div>
    <div className={`text-2xl font-black ${color}`}>{content}</div>
    <p className="text-[11px] text-slate-600 mt-1">{desc}</p>
  </div>
);

export default VideoUpload;
