import React, { useState, useEffect, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import { 
    Chart as ChartJS, CategoryScale, LinearScale, PointElement, 
    LineElement, Title, Tooltip, Legend, Filler 
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const FeatureCard = ({ icon, title, content, desc, color }) => (
    <div className="p-6 bg-slate-950/60 border border-white/5 rounded-2xl shadow-xl transition-all duration-300 hover:border-white/10">
        <div className="flex gap-3 mb-2 items-center">
            <span className="text-xl">{icon}</span>
            <h4 className="text-[10px] text-slate-500 uppercase tracking-[2px] font-bold">{title}</h4>
        </div>
        <div className={`text-3xl font-black ${color} tracking-tight uppercase transition-colors duration-500`}>
            {content}
        </div>
        <p className="text-[10px] text-slate-600 mt-2 font-medium italic">{desc}</p>
    </div>
);

const AnalyticsDashboard = ({ mode, isActive }) => {
    const [peopleCount, setPeopleCount] = useState(0);
    const [risk, setRisk] = useState("IDLE");
    const [logs, setLogs] = useState([]);
    const pollRef = useRef(null);
    const historyRef = useRef([]);

    const getBlankData = () => ({
        labels: Array(10).fill(''),
        datasets: [{
            label: 'Activity',
            data: Array(10).fill(0),
            borderColor: 'rgba(59, 130, 246, 0.1)',
            borderWidth: 1,
            pointRadius: 0,
            fill: false,
        }],
    });

    const [chartData, setChartData] = useState(getBlankData());

    useEffect(() => {
        if (!isActive) {
            if (pollRef.current) clearInterval(pollRef.current);
            setPeopleCount(0);
            setRisk("IDLE");
            setLogs([]);
            historyRef.current = [];
            setChartData(getBlankData());
            return;
        }

        const endpoint = mode === "live" ? "/live_progress" : "/progress";
        
        const fetchData = async () => {
            try {
                const res = await fetch(`http://127.0.0.1:5000${endpoint}`);
                if (!res.ok) throw new Error("Offline");
                const data = await res.json();

                const currentCount = Number(data.people_count) || 0;
                const currentRisk = data.risk || "LOW";

                // 🔥 LOGIC: Decide what value goes on the Graph
                let graphValue;
                if (mode === "video") {
                    const riskMap = { "LOW": 1, "MEDIUM": 2, "HIGH": 3 };
                    graphValue = riskMap[currentRisk.toUpperCase()] || 1;
                } else {
                    graphValue = currentCount;
                }

                setPeopleCount(currentCount);
                setRisk(currentRisk);

                const time = new Date().toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' });
                
                historyRef.current.push({ time, value: graphValue });
                if (historyRef.current.length > 10) historyRef.current.shift();

                const newLog = `[${time}] ${mode.toUpperCase()} > ${currentRisk} (Val: ${graphValue})`;
                setLogs(prev => [newLog, ...prev].slice(0, 6));

                setChartData({
                    labels: historyRef.current.map(d => d.time),
                    datasets: [{
                        label: mode === 'video' ? 'Risk Level' : 'People Count',
                        data: historyRef.current.map(d => d.value),
                        borderColor: '#3b82f6',
                        backgroundColor: (context) => {
                            const canvas = context.chart.ctx;
                            const gradient = canvas.createLinearGradient(0, 0, 0, 300);
                            gradient.addColorStop(0, 'rgba(59, 130, 246, 0.4)');
                            gradient.addColorStop(1, 'rgba(59, 130, 246, 0.0)');
                            return gradient;
                        },
                        borderWidth: 3,
                        tension: 0.4,
                        fill: true,
                        pointRadius: 4,
                        pointBackgroundColor: '#3b82f6'
                    }]
                });
            } catch (err) { console.warn("Sync error"); }
        };

        fetchData();
        pollRef.current = setInterval(fetchData, 1000);
        return () => { if (pollRef.current) clearInterval(pollRef.current); };
    }, [mode, isActive]);

    return (
        <div className="w-full max-w-7xl mx-auto mt-6 px-6 py-8 bg-slate-900/20 backdrop-blur-xl rounded-[32px] border border-white/5 shadow-2xl">
            <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-6">
                <div>
                    <h2 className="text-2xl font-black text-white tracking-tighter italic">INTELLIGENCE UNIT</h2>
                    <div className="flex items-center gap-2 mt-1">
                        <span className={`h-2 w-2 rounded-full ${isActive ? 'bg-blue-500 animate-pulse' : 'bg-slate-600'}`}></span>
                        <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">
                            {isActive ? "System Streaming" : "Analytics Standby"}
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[10px] text-slate-500 font-mono uppercase">Dashboard Mode</p>
                    <p className="text-xs font-bold text-blue-400 uppercase tracking-widest">{mode}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1 flex flex-col gap-4">
                    <FeatureCard 
                        icon="⚠️" 
                        title="Risk Analysis" 
                        content={risk} 
                        color={risk === "HIGH" ? "text-red-500" : isActive ? "text-blue-400" : "text-slate-600"} 
                        desc="Threat Assessment" 
                    />
                    {/* Only show "Detected Units" card if we are in Live Mode */}
                    {mode === 'live' && (
                        <FeatureCard 
                            icon="👁️" 
                            title="Detected Units" 
                            content={peopleCount} 
                            color={isActive ? "text-white" : "text-slate-600"} 
                            desc="Real-time object tracking" 
                        />
                    )}
                </div>

                <div className="lg:col-span-2 bg-slate-950/40 border border-white/5 rounded-3xl p-6 h-[320px] relative">
                    <Line 
                        data={chartData} 
                        options={{
                            responsive: true, 
                            maintainAspectRatio: false,
                            plugins: { legend: { display: false } },
                            scales: { 
                                x: { grid: { display: false }, ticks: { color: '#475569', font: { size: 9 } } },
                                y: { 
                                    beginAtZero: true, 
                                    // Adjust scale based on mode
                                    suggestedMax: mode === 'video' ? 4 : 10,
                                    grid: { color: 'rgba(255,255,255,0.03)' }, 
                                    ticks: { 
                                        color: '#475569', 
                                        stepSize: 1,
                                        callback: function(value) {
                                            if (mode === 'video') {
                                                if (value === 1) return 'LOW';
                                                if (value === 2) return 'MED';
                                                if (value === 3) return 'HIGH';
                                                return '';
                                            }
                                            return value;
                                        }
                                    } 
                                }
                            }
                        }} 
                    />
                </div>

                <div className="lg:col-span-1 bg-black/40 border border-white/5 rounded-3xl p-5 flex flex-col h-[320px]">
                    <h4 className="text-[10px] text-blue-500 font-black tracking-widest mb-4 uppercase">System Logs</h4>
                    <div className="flex-1 space-y-3 overflow-hidden">
                        {isActive ? logs.map((log, i) => (
                            <div key={i} className="text-[9px] font-mono text-slate-400 border-l-2 border-blue-500/30 pl-2">
                                {log}
                            </div>
                        )) : (
                            <div className="h-full flex items-center justify-center opacity-20">
                                <p className="text-[9px] text-slate-500 font-mono text-center uppercase">No Activity</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
