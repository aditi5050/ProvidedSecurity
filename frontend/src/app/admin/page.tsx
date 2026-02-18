"use client";
import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [stock, setStock] = useState(100);
  const [bots, setBots] = useState(0);
  const [attackMode, setAttackMode] = useState("off");
  const [logs, setLogs] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // 1. Connect to WebSocket
    const ws = new WebSocket("ws://localhost:8000/ws");

    ws.onopen = () => setIsConnected(true);
    ws.onclose = () => setIsConnected(false);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      // Update Stats
      if (data.stock !== undefined) setStock(parseInt(data.stock));
      if (data.bots !== undefined) setBots(parseInt(data.bots));
      if (data.attack_mode !== undefined) setAttackMode(data.attack_mode);
      
      // Add Logs for specific events
      if(data.type === 'update') {
          const timestamp = new Date().toLocaleTimeString();
          setLogs(prev => [`[${timestamp}] Stock Updated: ${data.stock}`, ...prev.slice(0, 5)]);
      }
    };

    return () => ws.close();
  }, []);

  return (
    <div className="min-h-screen bg-black p-6 font-mono text-green-500 selection:bg-green-900">
      
      {/* HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-center mb-8 border-b border-green-900 pb-4 gap-4">
        <div>
          <h1 className="text-3xl font-bold uppercase tracking-widest text-white">
            Sentinel <span className="text-green-500">Command</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            SYSTEM STATUS: {isConnected ? <span className="text-green-500">ONLINE</span> : <span className="text-red-500">OFFLINE</span>}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-green-900/10 border border-green-900 rounded-full">
            <span className={`h-2 w-2 rounded-full ${isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"}`}></span>
            <span className="text-xs font-bold tracking-wider text-green-400">
              {isConnected ? "LIVE FEED ACTIVE" : "RECONNECTING..."}
            </span>
          </div>
        </div>
      </header>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard 
          label="Live Inventory" 
          value={stock} 
          color={stock < 10 ? "text-red-500" : "text-white"} 
        />
        <StatCard 
          label="Bots Banned" 
          value={bots} 
          color="text-red-500" 
        />
        <StatCard 
          label="Requests/Sec" 
          value="1,204" 
          color="text-blue-400" 
        />
        <div className="bg-gray-900/50 border border-gray-800 p-4 rounded-lg flex flex-col justify-between">
           <span className="text-gray-500 text-[10px] uppercase tracking-wider">Attack Mode</span>
           <div className={`text-xl font-bold uppercase ${attackMode === "on" ? "text-red-500 animate-pulse" : "text-gray-400"}`}>
             {attackMode === "on" ? "⚠️ ACTIVE" : "STANDBY"}
           </div>
        </div>
      </div>

      {/* MAIN VISUALIZATION AREA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT: LOG FEED */}
        <div className="lg:col-span-1 border border-green-900/50 rounded-lg bg-black overflow-hidden flex flex-col h-96">
          <div className="bg-green-900/10 p-3 border-b border-green-900/50 flex justify-between items-center">
            <h3 className="text-white text-xs font-bold uppercase tracking-widest">Event Log</h3>
            <span className="text-[10px] text-green-600 animate-pulse">● REC</span>
          </div>
          <div className="p-4 space-y-3 overflow-y-auto flex-1 font-mono text-xs">
            {logs.map((log, i) => (
               <div key={i} className="flex gap-2 border-l-2 border-green-800 pl-2 opacity-80 hover:opacity-100 transition-opacity">
                 <span className="text-green-400">{log}</span>
               </div>
            ))}
            {logs.length === 0 && <div className="text-gray-700 italic">Waiting for traffic stream...</div>}
            
            {/* Fake filler data for visual effect */}
            <div className="text-gray-800">[SYSTEM] Garbage Collection started</div>
            <div className="text-gray-800">[SYSTEM] Redis memory usage: 12MB</div>
          </div>
        </div>

        {/* RIGHT: CYBER THREAT MAP */}
        <div className="lg:col-span-2 border border-green-900/50 rounded-lg h-96 relative bg-black overflow-hidden group">
            {/* World Map Background */}
            <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')] bg-cover opacity-20 bg-center grayscale invert pointer-events-none"></div>
            
            {/* Overlay Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.03)_1px,transparent_1px)] bg-[size:20px_20px]"></div>

            <div className="absolute top-4 left-4 z-10">
                <h3 className="text-white text-xs font-bold uppercase tracking-widest border-b border-green-500 pb-1 inline-block">Global Threat Map</h3>
            </div>
            
            {/* Animated "Pings" - Randomly placed to simulate global traffic */}
            <MapPing top="30%" left="20%" color="bg-blue-500" delay="0s" />  {/* USA */}
            <MapPing top="35%" left="25%" color="bg-blue-500" delay="1.2s" /> {/* USA East */}
            <MapPing top="25%" left="48%" color="bg-blue-500" delay="0.5s" /> {/* Europe */}
            <MapPing top="40%" left="75%" color="bg-red-500" delay="2s" />    {/* China (Bot) */}
            <MapPing top="60%" left="80%" color="bg-red-500" delay="1.5s" />  {/* Australia (Bot) */}
            
            {/* Status Footer */}
            <div className="absolute bottom-4 right-4 text-right space-y-1">
                <p className="text-[10px] text-green-600 font-mono">NODE_US_EAST: <span className="text-white">ONLINE</span></p>
                <p className="text-[10px] text-green-600 font-mono">NODE_EU_WEST: <span className="text-white">ONLINE</span></p>
                <p className="text-[10px] text-red-500 font-mono animate-pulse">NODE_ASIA_01: HIGH LOAD</p>
            </div>
        </div>

      </div>
    </div>
  );
}

// --- SUB COMPONENTS ---

function StatCard({ label, value, color }: { label: string, value: string | number, color: string }) {
  return (
    <div className="bg-gray-900/50 border border-gray-800 p-4 rounded-lg flex flex-col justify-between hover:bg-gray-900 transition-colors">
      <h3 className="text-gray-500 text-[10px] uppercase tracking-wider mb-1">{label}</h3>
      <p className={`text-3xl font-bold font-mono ${color}`}>{value}</p>
    </div>
  );
}

function MapPing({ top, left, color, delay }: { top: string, left: string, color: string, delay: string }) {
    return (
        <span className="absolute flex h-3 w-3" style={{ top, left }}>
          <span 
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${color}`} 
            style={{ animationDuration: '2s', animationDelay: delay }}
          ></span>
          <span className={`relative inline-flex rounded-full h-3 w-3 ${color}`}></span>
        </span>
    );
}