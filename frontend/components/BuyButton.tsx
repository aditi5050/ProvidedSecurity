"use client";
import { useState, useEffect, useRef } from "react";

export default function BuyButton() {
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [mouseTrail, setMouseTrail] = useState<number[][]>([]);
  const [computing, setComputing] = useState(false);

  // 1. TRACK MOUSE MOVEMENT
  const handleMouseMove = (e: React.MouseEvent) => {
    // Only keep the last 50 points to save bandwidth
    if (mouseTrail.length < 50) {
      setMouseTrail((prev) => [...prev, [e.clientX, e.clientY]]);
    }
  };

  // 2. SOLVE PROOF OF WORK (SHA-256)
  const solvePoW = async (challenge: string, difficulty: number = 3) => {
    let nonce = 0;
    const encoder = new TextEncoder();

    while (true) {
      const str = challenge + nonce;
      const buffer = encoder.encode(str);
      const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      if (hashHex.startsWith("0".repeat(difficulty))) {
        return nonce; // FOUND IT!
      }
      nonce++;
      
      // Safety break for demo (prevent freezing)
      if (nonce > 1000000) return 0;
    }
  };

  const handleBuy = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus("");

    // Grab form data
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());

    try {
      // START PROOF OF WORK
      setComputing(true);
      const challenge = "iphone15_sale_session"; // In real app, fetch this from backend
      const nonce = await solvePoW(challenge, 3); // Find hash starting with "000"
      setComputing(false);

      // SEND TO BACKEND
      const response = await fetch("http://localhost:8000/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: "user_" + Math.floor(Math.random() * 10000),
          item_id: "iphone_15_pro",
          honey_pot: data.honey_pot,
          device_fingerprint: "browser-fingerprint-123",
          // The new Security Headers:
          pow_challenge: challenge,
          pow_nonce: nonce,
          mouse_trail: mouseTrail // Sending your movement history
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setStatus("✅ " + result.message);
      } else {
        setStatus("❌ " + result.detail);
      }
    } catch (err) {
      setStatus("⚠️ Connection Error");
    }

    setLoading(false);
    setComputing(false);
  };

  return (
    <div 
      className="p-8 rounded-2xl bg-gray-900 border border-gray-700 shadow-2xl max-w-md w-full mx-auto relative overflow-hidden"
      onMouseMove={handleMouseMove} // <--- TRACKING LISTENER
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">iPhone 15 Pro</h2>
        <span className="bg-blue-600 text-xs font-bold px-2 py-1 rounded text-white uppercase tracking-wider">
          Flash Sale
        </span>
      </div>

      <div className="text-gray-400 mb-6 text-sm">
        <p>Titanium Design • A17 Pro Chip • 5x Telephoto</p>
        <div className="mt-4 flex items-end gap-2">
          <span className="text-3xl font-bold text-white">$999</span>
          <span className="text-gray-500 line-through mb-1">$1,299</span>
        </div>
      </div>

      <form onSubmit={handleBuy} className="flex flex-col gap-4">
        {/* INVISIBLE BOT TRAP */}
        <input type="text" name="honey_pot" className="opacity-0 absolute -z-10 w-0 h-0" autoComplete="off" />

        <button
          type="submit"
          disabled={loading || computing}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
            computing 
              ? "bg-yellow-600 text-white cursor-wait" // Yellow when mining
              : loading 
                ? "bg-gray-700 text-gray-400" 
                : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-105 text-white"
          }`}
        >
          {computing ? "Solving Puzzle (PoW)..." : loading ? "Processing..." : "BUY NOW ⚡"}
        </button>
      </form>

      {/* DEBUG: Show Mouse Trail Count */}
      <div className="mt-2 text-xs text-gray-600 font-mono text-center">
        Security: {mouseTrail.length > 5 ? "Human Movement Detected ✅" : "Waiting for input..."}
      </div>

      {status && (
        <div className={`mt-6 p-4 rounded-lg font-mono text-sm border ${
          status.includes("✅") ? "bg-green-900/30 border-green-800 text-green-400" : "bg-red-900/30 border-red-800 text-red-400"
        }`}>
          {status}
        </div>
      )}
    </div>
  );
}