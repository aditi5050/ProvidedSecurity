"use client";
import React, { useState, useEffect } from "react";
import { Shield, Zap, ShoppingCart, Users, AlertTriangle } from "lucide-react";
import confetti from "canvas-confetti";

export default function SentinelDashboard() {
  const [view, setView] = useState("COMMERCE"); // COMMERCE | CREATOR
  const [stats, setStats] = useState({ stock: 100, bots: 0, queue: 0 });
  const [mouseTrail, setMouseTrail] = useState<number[][]>([]);
  const [status, setStatus] = useState("IDLE");

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8000/ws");
    ws.onmessage = (e) => setStats(JSON.parse(e.data));
    
    const track = (e: MouseEvent) => {
        if (mouseTrail.length < 20) setMouseTrail(p => [...p, [e.clientX, e.clientY]]);
    };
    window.addEventListener("mousemove", track);
    return () => { ws.close(); window.removeEventListener("mousemove", track); };
  }, [mouseTrail]);

  const getFingerprint = () => btoa(navigator.userAgent + navigator.languages[0] + window.screen.width);

  const solvePoW = async (challenge: string) => {
    let nonce = 0;
    while (true) {
      const msg = new TextEncoder().encode(challenge + nonce);
      const hash = await crypto.subtle.digest("SHA-256", msg);
      if (Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2,'0')).join('').startsWith("000")) return nonce;
      nonce++;
    }
  };

  const handleAction = async () => {
    setStatus("PROCESSING");
    const challenge = "sentinel_v2";
    const nonce = await solvePoW(challenge);
    
    const endpoint = view === "COMMERCE" ? "/buy" : "/protect-view";
    const body = {
        user_id: "user_123",
        device_fingerprint: getFingerprint(),
        mouse_trail: mouseTrail.length > 0 ? mouseTrail : [[0,0]], // Keyboard fallback
        pow_nonce: nonce,
        pow_challenge: challenge,
        ...(view === "COMMERCE" ? { quantity: 1, honeypot: null } : { page_id: "stream_01" })
    };

    const res = await fetch(`http://localhost:8000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });

    if (res.ok) {
        setStatus("SUCCESS");
        if (view === "COMMERCE") confetti();
        setTimeout(() => setStatus("IDLE"), 2000);
    } else {
        setStatus("BLOCKED");
        setTimeout(() => setStatus("IDLE"), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8 font-mono">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* HEADER STATS */}
        <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-900 p-4 rounded-xl border border-blue-500/30">
                <p className="text-blue-400 text-xs">STOCK</p>
                <p className="text-3xl font-bold">{stats.stock}</p>
            </div>
            <div className="bg-gray-900 p-4 rounded-xl border border-red-500/30">
                <p className="text-red-400 text-xs">BOTS BLOCKED</p>
                <p className="text-3xl font-bold">{stats.bots}</p>
            </div>
            <div className="bg-gray-900 p-4 rounded-xl border border-orange-500/30">
                <p className="text-orange-400 text-xs">QUEUE POSITION</p>
                <p className="text-3xl font-bold">{stats.queue}</p>
            </div>
        </div>

        {/* MODE TOGGLE */}
        <div className="flex gap-4">
            <button onClick={() => setView("COMMERCE")} className={`px-6 py-2 rounded-lg border ${view === 'COMMERCE' ? 'bg-blue-600 border-white' : 'border-gray-700'}`}>Flash Sale</button>
            <button onClick={() => setView("CREATOR")} className={`px-6 py-2 rounded-lg border ${view === 'CREATOR' ? 'bg-purple-600 border-white' : 'border-gray-700'}`}>Creator Shield</button>
        </div>

        {/* THE ACTION AREA */}
        <div className="bg-gray-900 p-12 rounded-3xl border border-gray-800 text-center space-y-6">
            <Shield className={`w-20 h-20 mx-auto ${status === 'BLOCKED' ? 'text-red-500' : 'text-blue-500'}`} />
            <h2 className="text-2xl font-bold">{view === "COMMERCE" ? "Limited iPhone 15 Pro" : "Live Stream: Bot Protection"}</h2>
            
            <button 
                onClick={handleAction}
                disabled={status === "PROCESSING"}
                className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
            >
                {status === "PROCESSING" ? <><Zap className="animate-spin" /> MINING POW...</> : 
                 status === "BLOCKED" ? "🚫 ACCESS DENIED" : 
                 view === "COMMERCE" ? "SECURE CHECKOUT" : "JOIN STREAM"}
            </button>
        </div>
      </div>
    </div>
  );
}