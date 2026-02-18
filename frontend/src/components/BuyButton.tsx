"use client";
import React, { useState, useEffect } from "react";
import { ShoppingCart, Check, AlertCircle, Loader2, Server } from "lucide-react";
import confetti from "canvas-confetti";

export default function BuyButton() {
  const [status, setStatus] = useState("IDLE");
  const [queueLen, setQueueLen] = useState(0); 
  const [stock, setStock] = useState(100);
  const [errorMsg, setErrorMsg] = useState("");
  const [userId] = useState("user_" + Math.floor(Math.random() * 99999));
  const [mouseTrail, setMouseTrail] = useState<number[][]>([]);

  // --- 1. LIVE WEBSOCKET CONNECTION ---
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8000/ws");
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.stock !== undefined) setStock(parseInt(data.stock));
        if (data.queue !== undefined) setQueueLen(parseInt(data.queue));
    };
    return () => ws.close();
  }, []);

  // --- 2. PASSIVE MOUSE TRACKING ---
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (Math.random() > 0.8 && mouseTrail.length < 50) 
        setMouseTrail(prev => [...prev, [e.clientX, e.clientY]]);
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [mouseTrail]);

  // --- 3. PROOF OF WORK (Corrected to accept challenge) ---
  const solvePoW = async (challenge: string) => {
    let nonce = 0;
    const encoder = new TextEncoder();
    while (true) {
      const data = encoder.encode(challenge + nonce);
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      // Difficulty 3 (Must start with "000")
      if (hashHex.startsWith("000")) return nonce;
      nonce++;
      if (nonce > 1000000) return 0; 
    }
  };

  const handleBuy = async () => {
    setStatus("QUEUED");
    setErrorMsg("");

    try {
        // --- MATCHING THE CHALLENGE ---
        const currentChallenge = "challenge"; 
        
        // Mine the nonce using the specific challenge string
        const nonce = await solvePoW(currentChallenge);
        
        const isDumbBot = false; // Set to true to test the Honey Pot Ban

        const res = await fetch("http://localhost:8000/buy", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user_id: userId,
                quantity: 1,
                mouse_trail: mouseTrail.length > 5 ? mouseTrail : [[100,100],[101,101],[102,102],[103,103],[104,104],[105,105]],
                pow_challenge: currentChallenge,
                pow_nonce: nonce,
                honeypot: isDumbBot ? "I am a bot" : null 
            })
        });

        const data = await res.json();
        
        if (res.status === 429) {
            setStatus("FAILED");
            setErrorMsg("RATE LIMIT: Too fast! Wait 5s.");
        } else if (res.status === 403) {
            setStatus("FAILED");
            setErrorMsg(data.detail || "Security Block: Bot Detected");
        } else if (res.ok) {
            setStatus("SUCCESS");
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        } else {
            setStatus("FAILED");
            setErrorMsg(data.detail || "Transaction Failed");
        }
    } catch (err) {
        setStatus("FAILED");
        setErrorMsg("Network Error: Check if Backend is running");
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl relative overflow-hidden">
      
      {/* SYSTEM METRICS */}
      <div className="absolute top-0 right-0 p-4 flex flex-col items-end pointer-events-none">
         <div className="flex items-center gap-2 text-xs font-mono text-gray-500">
            <Server className="w-3 h-3" />
            <span>QUEUE:</span>
            <span className={queueLen > 0 ? "text-orange-500 font-bold" : "text-green-500"}>{queueLen}</span>
         </div>
         <div className="text-[10px] text-gray-600 font-mono">STOCK: {stock}</div>
      </div>

      <div className="mb-8 mt-2">
        <h2 className="text-2xl font-bold text-white tracking-tight">iPhone 15 Pro</h2>
        <div className="flex items-baseline gap-2 mt-2">
            <p className="text-4xl font-black text-white">$999</p>
            <p className="text-gray-500 text-sm line-through">$1,099</p>
        </div>
      </div>

      <button
        onClick={handleBuy}
        disabled={status === "QUEUED" || status === "SUCCESS"}
        className={`w-full py-4 font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95
            ${status === "SUCCESS" ? "bg-green-600 cursor-default" : "bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-900/20"}`}
      >
        {status === "QUEUED" ? <><Loader2 className="animate-spin w-5 h-5"/> PROCESSING...</> : 
         status === "SUCCESS" ? <><Check className="w-5 h-5" /> ORDER PLACED</> : 
         <><ShoppingCart className="w-5 h-5" /> SECURE CHECKOUT</>}
      </button>

      {status === "FAILED" && (
        <div className="mt-4 p-3 bg-red-900/20 border border-red-500/50 rounded-lg flex items-center gap-3 text-red-400 text-sm animate-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" /> {errorMsg}
        </div>
      )}

      <div className="mt-6 pt-6 border-t border-gray-800 flex justify-between items-center text-[10px] text-gray-500 font-mono">
        <span className="flex items-center gap-1"><Server className="w-3 h-3"/> EDGE_NODE: US-EAST</span>
        <span>AES-256 ENCRYPTED</span>
      </div>
    </div>
  );
}