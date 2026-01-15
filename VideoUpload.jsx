import React, { useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTriangleExclamation,
  faUsers,
  faPersonRunning,
} from "@fortawesome/free-solid-svg-icons";

// 🔹 Props added here to receive handleDetectionToggle from App.jsx
const VideoUpload = (props) => {
  const [status, setStatus] = useState("idle");
  const [videoSrc, setVideoSrc] = useState(null);

  const [risk, setRisk] = useState("Waiting for data...");
  const [peopleCount, setPeopleCount] = useState(0);
  const [place, setPlace] = useState("Unknown");

  const fileInputRef = useRef(null);
  const pollRef = useRef(null);

  const startPolling = () => {
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch("http://127.0.0.1:5000/progress");
        const data = await res.json();

        setRisk(data.risk);
        setPeopleCount(data.people_count);
        setPlace(data.place);

        if (data.status === "Done") {
          clearInterval(pollRef.current);
          setStatus("completed");
          // Optionally turn off chart when finished: props.setStatus(false);
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 1500);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("video/")) return;

    setVideoSrc(URL.createObjectURL(file));
    setStatus("processing");

    // 🚨 SIGNAL TO DASHBOARD: Start the chart
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
      console.error(err);
      setStatus("idle");
      if (props.setStatus) props.setStatus(false);
    }
  };

  const handleRestart = () => {
    clearInterval(pollRef.current);
    setVideoSrc(null);
    setRisk("Waiting for data...");
    setPeopleCount(0);
    setPlace("Unknown");
    setStatus("idle");
    
    // 🚨 SIGNAL TO DASHBOARD: Reset/Clear the chart
    if (props.setStatus) props.setStatus(false);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-5 bg-slate-900/40 backdrop-blur-md rounded-3xl border border-white/5 shadow-2xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-white">
          {status === "idle" ? "Upload Video" : "Intelligence Feed"}
        </h2>
        {status !== "idle" && (
          <button onClick={handleRestart} className="px-5 py-2 text-xs font-bold bg-slate-800 text-slate-300 rounded-xl">
            Terminate
          </button>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-grow max-w-4xl aspect-video rounded-2xl overflow-hidden border border-white/10">
          {status === "idle" ? (
            <div onClick={() => fileInputRef.current.click()} className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
              <input type="file" hidden ref={fileInputRef} accept="video/*" onChange={handleFileUpload} />
              <p className="text-white text-xl">Drop Surveillance Feed</p>
            </div>
          ) : (
            <video src={videoSrc} className="w-full h-full object-cover" autoPlay controls />
          )}
        </div>

        <div className="w-full lg:w-80 flex flex-col gap-4">
          <FeatureCard icon={faTriangleExclamation} title="Risk Factor" content={risk} desc="Crowd density & threat analysis" color={risk === "HIGH" ? "text-red-500" : "text-green-400"} />
          <FeatureCard icon={faPersonRunning} title="Motion Status" content={peopleCount > 0 ? "ACTIVE" : "IDLE"} color={peopleCount > 0 ? "text-green-400" : "text-slate-400"} desc="Movement detected" />
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, content, desc, color }) => (
  <div className="p-6 bg-slate-950/60 border border-white/5 rounded-2xl">
    <div className="flex gap-3 mb-2 items-center">
      <FontAwesomeIcon icon={icon} className="text-slate-400" size="sm" />
      <h4 className="text-xs text-slate-400 uppercase">{title}</h4>
    </div>
    <div className={`text-2xl font-black ${color}`}>{content}</div>
    <p className="text-[11px] text-slate-600">{desc}</p>
  </div>
);

export default VideoUpload;
