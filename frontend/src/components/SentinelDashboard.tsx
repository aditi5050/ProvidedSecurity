"use client";
import React, { useState, useEffect } from "react";
import { ShoppingCart, Check, AlertCircle, Loader2, Shield, Activity } from "lucide-react";
import confetti from "canvas-confetti";

export default function SentinelBuy() {
  const [status, setStatus] = useState("IDLE");
  const [stats, setStats] = useState({ stock: 0, bots: 0, queue: 0 });
  const [errorMsg, setErrorMsg] = useState("");
  const [mouseTrail, setMouseTrail] = useState<number[][]>([]);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8000/ws");
    ws.onmessage = (e) => setStats(JSON.parse(e.data));
    const track = (e: MouseEvent) => {
        if (mouseTrail.length < 50) setMouseTrail(p => [...p, [e.clientX, e.clientY]]);
    };
    window.addEventListener("mousemove", track);
    return () => { ws.close(); window.removeEventListener("mousemove", track); };
  }, [mouseTrail]);

  // FINGERPRINTING: Hardware + Browser Identity
  const getFingerprint = () => {
    const { hardwareConcurrency, platform } = navigator;
    const { width, height } = screen;
    return btoa(`${hardwareConcurrency}-${platform}-${width}x${height}`);
  };

  // PROOF OF WORK: Browser "Mining" to throttle bots
  const solvePoW = async (challenge: string) => {
    let nonce = 0;
    while (true) {
      const msg = new TextEncoder().encode(challenge + nonce);
      const hash = await crypto.subtle.digest("SHA-256", msg);
      const hex = Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2,'0')).join('');
      if (hex.startsWith("000")) return nonce;
      nonce++;
    }
  };

  const handleBuy = async () => {
    setStatus("MINING");
    setErrorMsg("");

    try {
        const challenge = "sentinel_v1";
        const nonce = await solvePoW(challenge);
        
        const res = await fetch("http://localhost:8000/buy", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user_id: "user_" + Math.random().toString(36).substring(7),
                device_fingerprint: getFingerprint(),
                mouse_trail: mouseTrail.length > 5 ? mouseTrail : [[0,0]],
                pow_challenge: challenge,
                pow_nonce: nonce,
                honeypot: null
            })
        });

        const data = await res.json();
        if (res.ok) {
            setStatus("SUCCESS");
            confetti();
        } else {
            setStatus("FAILED");
            setErrorMsg(Array.isArray(data.detail) ? data.detail[0].msg : data.detail);
        }
    } catch (err) {
        setStatus("FAILED");
        setErrorMsg("Server Disconnected");
    }
  };

  return (
    <div className="bg-gray-950 border border-gray-800 rounded-3xl p-8 w-full max-w-md shadow-2xl overflow-hidden relative">
      <div className="flex justify-between items-center mb-10">
        <Shield className="text-blue-500 w-8 h-8" />
        <div className="text-right">
            <p className="text-[10px] text-gray-500 font-mono">NODE_US_EAST</p>
            <p className="text-xl font-bold text-white leading-none">{stats.stock} LEFT</p>
        </div>
      </div>

      <div className="space-y-4 mb-8">
        <h2 className="text-2xl font-bold text-white">iPhone 15 Pro</h2>
        <div className="flex items-center gap-2 text-xs text-orange-500 font-mono">
            <Activity className="w-3 h-3 animate-pulse" />
            <span>{stats.queue} REQUESTS IN QUEUE</span>
        </div>
      </div>

      <button
        onClick={handleBuy}
        disabled={status === "MINING" || status === "SUCCESS"}
        className={`w-full py-5 rounded-2xl font-black text-lg transition-all 
            ${status === 'SUCCESS' ? 'bg-green-600' : 'bg-white text-black hover:bg-gray-200 active:scale-95'}`}
      >
        {status === "MINING" ? <><Loader2 className="animate-spin inline mr-2"/> MINING POW...</> : 
         status === "SUCCESS" ? "RESERVED" : "SECURE CHECKOUT"}
      </button>

      {status === "FAILED" && (
        <div className="mt-4 p-3 bg-red-950 border border-red-800 rounded-xl flex items-center gap-3 text-red-400 text-xs">
            <AlertCircle className="w-4 h-4" /> {errorMsg}
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-gray-900 flex justify-between text-[10px] text-gray-600 font-mono">
        <span>BOTS BLOCKED: {stats.bots}</span>
        <span>AES-256 SECURED</span>
      </div>
    </div>
  );
}