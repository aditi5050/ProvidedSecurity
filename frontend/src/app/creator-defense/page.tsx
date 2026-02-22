"use client";
import React, { useState } from "react";
import { Play, ShieldCheck, Ghost, MousePointer2 } from "lucide-react";

export default function CreatorDefense() {
  const [log, setLog] = useState<string[]>([]);
  const [status, setStatus] = useState("IDLE");

  const simulateRequest = async (isBot: boolean) => {
    setStatus("TESTING");
    try {
      const res = await fetch("http://localhost:8000/protect-view", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: "test_user",
          device_fingerprint: "test_device_" + Math.random(),
          mouse_trail: isBot ? [] : [[10,10], [11,11], [12,12], [13,13], [14,14]], // Bots send empty trails
          pow_nonce: 0, // Simplified for testing
          pow_challenge: "test",
          page_id: "creator_01"
        })
      });
      
      const data = await res.json();
      const time = new Date().toLocaleTimeString();
      
      if (res.ok) {
        setLog(prev => [`[${time}] ✅ HUMAN VIEW VERIFIED`, ...prev]);
      } else {
        setLog(prev => [`[${time}] 🚫 BOT BLOCKED: ${data.detail}`, ...prev]);
      }
    } catch (e) {
      setLog(prev => [`[${time}] ❌ CONNECTION ERROR`, ...prev]);
    }
    setStatus("IDLE");
  };

  return (
    <div className="min-h-screen bg-black text-white p-12 flex flex-col items-center">
      <div className="w-full max-w-2xl bg-gray-900 rounded-3xl p-8 border border-purple-500/30">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
            <Play fill="white" />
          </div>
          <div>
            <h2 className="font-bold text-xl">Cyber-Security Livestream</h2>
            <p className="text-purple-400 text-xs">SENTINEL PROTECTION ACTIVE</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <button 
            onClick={() => simulateRequest(false)}
            className="p-4 bg-green-600/20 border border-green-500/50 rounded-xl hover:bg-green-600/30 flex flex-col items-center gap-2"
          >
            <MousePointer2 className="text-green-500" />
            <span className="text-xs font-bold">SIMULATE HUMAN</span>
          </button>
          <button 
            onClick={() => simulateRequest(true)}
            className="p-4 bg-red-600/20 border border-red-500/50 rounded-xl hover:bg-red-600/30 flex flex-col items-center gap-2"
          >
            <Ghost className="text-red-500" />
            <span className="text-xs font-bold">SIMULATE BOT</span>
          </button>
        </div>

        <div className="bg-black rounded-xl p-4 h-48 overflow-y-auto font-mono text-[10px] space-y-1">
          {log.map((line, i) => (
            <div key={i} className={line.includes('✅') ? 'text-green-500' : 'text-red-500'}>{line}</div>
          ))}
          {log.length === 0 && <div className="text-gray-700 italic">Waiting for traffic...</div>}
        </div>
      </div>
    </div>
  );
}