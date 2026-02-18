"use client";
import { useState, useEffect } from "react";
import { Video, Users, ShieldAlert, Activity, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CreatorDefense() {
  const [viewers, setViewers] = useState(1240);
  const [botsBlocked, setBotsBlocked] = useState(0);
  const [isAttacking, setIsAttacking] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  // SIMULATE BOT ATTACK
  const launchAttack = async () => {
    setIsAttacking(true);
    addLog("⚠️ DETECTED UNUSUAL TRAFFIC SPIKE...");
    
    // Simulate 20 fast requests
    for (let i = 0; i < 20; i++) {
      // 1. Send Request WITHOUT Mouse Data (Simulating a Dumb Bot)
      fetch("http://localhost:8000/protect-view", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: "bot_" + Math.random(),
          page_id: "creator_channel",
          mouse_trail: [], // EMPTY TRAIL = BOT
          pow_nonce: 0     // INVALID NONCE = BOT
        })
      }).then(res => {
        if (res.status === 403) {
            setBotsBlocked(prev => prev + 1);
            addLog(`🚫 BLOCKED IP: 192.168.1.${Math.floor(Math.random()*255)} (Reason: No Mouse Data)`);
        }
      });
      await new Promise(r => setTimeout(r, 100)); // Delay between bots
    }
    setIsAttacking(false);
    addLog("✅ ATTACK MITIGATED. TRAFFIC NORMALIZED.");
  };

  const addLog = (msg: string) => {
    setLogs(prev => [msg, ...prev].slice(0, 8));
  };

  return (
    <main className="min-h-screen bg-black text-white p-8 font-sans">
      <Link href="/" className="text-gray-500 hover:text-white flex items-center gap-2 mb-8">
        <ArrowLeft className="w-4 h-4" /> Back to Hub
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        
        {/* LEFT: THE "LIVE STREAM" (Simulated) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="relative aspect-video bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden flex items-center justify-center group">
            {/* Fake Stream UI */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6">
               <h2 className="text-2xl font-bold">Coding High Performance Systems 🔴 LIVE</h2>
               <div className="flex gap-4 mt-2">
                 <span className="flex items-center gap-2 text-red-500 font-bold animate-pulse"><Users className="w-4 h-4"/> {viewers.toLocaleString()} Watching</span>
                 <span className="text-gray-400">Started 1h ago</span>
               </div>
            </div>
            <Video className="w-24 h-24 text-gray-800" />
            
            {/* OVERLAY WHEN ATTACKING */}
            {isAttacking && (
                <div className="absolute top-4 right-4 bg-red-600/90 text-white px-4 py-2 rounded-lg font-bold animate-pulse flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5" /> DDoS ATTACK DETECTED
                </div>
            )}
          </div>

          {/* ATTACK CONTROLS */}
          <div className="p-6 bg-red-900/10 border border-red-900/30 rounded-2xl flex justify-between items-center">
             <div>
                <h3 className="font-bold text-red-400">Simulate Attack</h3>
                <p className="text-sm text-gray-400">Launch a swarm of 20 headless bots against this channel.</p>
             </div>
             <button 
                onClick={launchAttack}
                disabled={isAttacking}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50"
             >
                {isAttacking ? "MITIGATING..." : "🚀 LAUNCH BOT SWARM"}
             </button>
          </div>
        </div>

        {/* RIGHT: SECURITY DASHBOARD */}
        <div className="space-y-6">
           {/* STATS CARD */}
           <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-900 rounded-xl border border-gray-800">
                 <div className="text-gray-500 text-xs uppercase tracking-widest mb-1">Total Blocks</div>
                 <div className="text-3xl font-mono font-bold text-red-500">{botsBlocked}</div>
              </div>
              <div className="p-4 bg-gray-900 rounded-xl border border-gray-800">
                 <div className="text-gray-500 text-xs uppercase tracking-widest mb-1">System Load</div>
                 <div className="text-3xl font-mono font-bold text-green-500">
                    {isAttacking ? "89%" : "12%"}
                 </div>
              </div>
           </div>

           {/* LIVE LOGS */}
           <div className="bg-black border border-gray-800 rounded-xl p-4 h-[400px] overflow-hidden flex flex-col">
              <div className="flex items-center gap-2 text-gray-400 mb-4 pb-2 border-b border-gray-800">
                 <Activity className="w-4 h-4" /> SENTINEL LIVE LOGS
              </div>
              <div className="flex-1 space-y-2 font-mono text-xs overflow-y-auto">
                 {logs.map((log, i) => (
                    <div key={i} className={`p-2 rounded ${log.includes("BLOCKED") ? "bg-red-900/20 text-red-400" : "text-gray-300"}`}>
                       <span className="opacity-50 mr-2">[{new Date().toLocaleTimeString()}]</span>
                       {log}
                    </div>
                 ))}
                 {logs.length === 0 && <span className="text-gray-600 italic">System listening for traffic...</span>}
              </div>
           </div>
        </div>

      </div>
    </main>
  );
}