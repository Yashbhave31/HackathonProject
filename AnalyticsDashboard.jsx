import React, { useState, useEffect, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

/**
 * AnalyticsDashboard Component
 * Visualizes temporal trends and neural network activity logs.
 * Synchronizes with the backend using a high-frequency polling interval.
 */
const AnalyticsDashboard = ({ mode, isActive }) => {
    const [logs, setLogs] = useState([]);
    const [history, setHistory] = useState([]);
    const pollRef = useRef(null);

    useEffect(() => {
        // Reset state when system is disarmed or inactive
        if (!isActive) {
            setHistory([]);
            setLogs([]);
            return;
        }

        const endpoint = mode === "live" ? "/live_progress" : "/progress";
        
        const fetchData = async () => {
            try {
                const res = await fetch(`http://127.0.0.1:5000${endpoint}`);
                const data = await res.json();

                // Select metric based on active gateway (People Count for Live, Velocity for Video)
                const val = mode === "live" ? data.people_count : data.speed;
                const time = new Date().toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' });

                // Maintain a rolling buffer of the last 15 data points for the graph
                setHistory(prev => [...prev, { time, val }].slice(-15));
                
                // Update event logs with risk assessment and motion status
                const newLog = `[${time}] ${data.risk} RISK | Motion: ${data.motion || data.motion_status}`;
                setLogs(prev => [newLog, ...prev].slice(0, 5));
            } catch (err) { 
                console.warn("Telemetry sync lost: Backend unreachable"); 
            }
        };

        // Initialize polling interval (1.2s frequency)
        pollRef.current = setInterval(fetchData, 1200);
        
        // Cleanup interval on component unmount or dependency change
        return () => clearInterval(pollRef.current);
    }, [isActive, mode]);

    const chartData = {
        labels: history.map(h => h.time),
        datasets: [{
            label: mode === 'live' ? 'Entities' : 'Velocity',
            data: history.map(h => h.val),
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.4,
            borderWidth: 2,
            pointRadius: 0
        }]
    };

    return (
        <div className="w-full max-w-7xl mx-auto mt-6">
            {/* Component Header */}
            <div className="mb-6 text-left">
                <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                    <span className="w-2 h-8 bg-blue-600 rounded-full"></span>
                    SYSTEM ANALYTICS & NEURAL INTERPRETER
                </h1>
                <p className="text-slate-500 text-sm mt-2 font-medium">
                    Real-time data visualization of {mode === 'live' ? 'live camera feed' : 'uploaded surveillance footage'}.
                </p>
            </div>

            {/* Main Data Layer */}
            <div className="p-8 bg-slate-900/20 backdrop-blur-xl rounded-[32px] border border-white/5 shadow-2xl">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Graph Visualization */}
                    <div className="lg:col-span-2 h-[300px] bg-black/20 p-6 rounded-3xl border border-white/5">
                        <div className="flex justify-between mb-4">
                            <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Temporal Analysis (Crowd Density)</span>
                            <span className="text-[10px] text-slate-500 font-mono italic">
                                {isActive ? '● DATA_STREAM_ACTIVE' : '○ LINK_IDLE'}
                            </span>
                        </div>
                        <Line 
                            data={chartData} 
                            options={{ 
                                responsive: true, 
                                maintainAspectRatio: false, 
                                scales: { 
                                    x: { display: false }, 
                                    y: { 
                                        grid: { color: 'rgba(255,255,255,0.05)' }, 
                                        ticks: { color: '#475569', font: { size: 10 } } 
                                    } 
                                }, 
                                plugins: { legend: { display: false } } 
                            }} 
                        />
                    </div>

                    {/* Event Logging Interface */}
                    <div className="bg-black/40 p-6 rounded-3xl border border-white/5 flex flex-col">
                        <h4 className="text-[10px] text-slate-500 font-black uppercase mb-4 tracking-widest">Neural Logs</h4>
                        <div className="space-y-3 flex-grow">
                            {isActive ? logs.map((log, i) => (
                                <div key={i} className="text-[9px] font-mono text-blue-300/70 border-l border-blue-500/30 pl-3 animate-in fade-in slide-in-from-left">
                                    {log}
                                </div>
                            )) : (
                                <div className="h-full flex items-center justify-center opacity-20">
                                    <p className="text-[10px] text-slate-700 font-mono text-center uppercase tracking-tighter">No Active Data Link</p>
                                </div>
                            )}
                        </div>
                        {/* System Metadata */}
                        <div className="mt-4 pt-4 border-t border-white/5">
                             <div className="flex justify-between items-center text-[8px] font-mono text-slate-600">
                                <span>ID: CG-SERVER-01</span>
                                <span>STATUS: SECURE</span>
                             </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
