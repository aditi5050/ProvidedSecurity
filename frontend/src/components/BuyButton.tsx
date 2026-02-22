"use client";
import React, { useState, useEffect } from "react";
import { ShoppingCart, Check, AlertCircle, Loader2, Shield } from "lucide-react";
import confetti from "canvas-confetti";

export default function BuyButton() {
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

  const getFingerprint = () => btoa(`${navigator.hardwareConcurrency}-${screen.width}x${screen.height}`);

  const solvePoW = async (challenge: string) => {
    let nonce = 0;
    while (true) {
      const msg = new TextEncoder().encode(challenge + nonce);
      const hash = await crypto.subtle.digest("SHA-256", msg);
      if (Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2,'0')).join('').startsWith("000")) return nonce;
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
                pow_nonce: nonce
            })
        });
        const data = await res.json();
        if (res.ok) { setStatus("SUCCESS"); confetti(); }
        else { 
            setStatus("FAILED"); 
            setErrorMsg(Array.isArray(data.detail) ? data.detail[0].msg : data.detail); 
        }
    } catch (err) { setStatus("FAILED"); setErrorMsg("Server Disconnected"); }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 w-full max-w-md shadow-2xl relative">
      <div className="flex justify-between items-center mb-6">
        <Shield className="text-blue-500 w-6 h-6" />
        <span className="text-xs font-mono text-gray-500">{stats.stock} IN STOCK</span>
      </div>
      <h2 className="text-2xl font-bold text-white mb-8">iPhone 15 Pro</h2>
      <button
        onClick={handleBuy}
        disabled={status === "MINING" || status === "SUCCESS"}
        className={`w-full py-4 rounded-xl font-bold transition-all ${status === 'SUCCESS' ? 'bg-green-600' : 'bg-white text-black hover:bg-gray-200'}`}
      >
        {status === "MINING" ? <Loader2 className="animate-spin inline mr-2"/> : status === "SUCCESS" ? "RESERVED" : "BUY NOW"}
      </button>
      {status === "FAILED" && <div className="mt-4 text-red-400 text-xs flex items-center gap-2"><AlertCircle className="w-4 h-4"/> {errorMsg}</div>}
      <div className="mt-6 text-[10px] text-gray-600 font-mono flex justify-between">
        <span>BOTS BLOCKED: {stats.bots}</span>
        <span>QUEUE: {stats.queue}</span>
      </div>
    </div>
  );
}