"use client";
import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [stock, setStock] = useState(100);
  const [bots, setBots] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    // Connect to WebSocket
    const ws = new WebSocket("ws://localhost:8000/ws");

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.stock !== undefined) setStock(parseInt(data.stock));
      if (data.bots !== undefined) setBots(parseInt(data.bots));
      
      // Add a fake log entry for visual effect
      const timestamp = new Date().toLocaleTimeString();
      if(data.type === 'update') {
          setLogs(prev => [`[${timestamp}] Stock Updated: ${data.stock}`, ...prev.slice(0, 4)]);
      }
    };

    return () => ws.close();
  }, []);

  return (
    <div className="min-h-screen bg-black p-8 font-mono text-green-500">
      <header className="flex flex-col md:flex-row justify-between items-center mb-10 border-b border-green-900 pb-4 gap-4">
        <h1 className="text-3xl font-bold uppercase tracking-widest">Sentinel <span className="text-white">Live Center</span></h1>
        <div className="flex items-center gap-4 bg-green-900/20 px-4 py-2 rounded-full border border-green-900">
          <span className="animate-pulse h-3 w-3 bg-red-500 rounded-full"></span>
          <span className="text-red-500 font-bold">REAL-TIME CONNECTION</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* LIVE STOCK COUNTER */}
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-lg shadow-lg">
           <h3 className="text-gray-500 text-sm uppercase mb-2">Live Inventory</h3>
           <p className="text-6xl font-bold text-white">{stock}</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 p-6 rounded-lg shadow-lg">
           <h3 className="text-gray-500 text-sm uppercase mb-2">Requests / Sec</h3>
           <p className="text-4xl font-bold text-blue-400">1,240</p>
        </div>

        {/* LIVE BOT COUNTER */}
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-lg shadow-lg">
           <h3 className="text-gray-500 text-sm uppercase mb-2">Bots Blocked</h3>
           <p className="text-4xl font-bold text-red-500">{bots}</p>
        </div>
      </div>

      <div className="border border-green-900 rounded-lg p-4 h-64 overflow-hidden relative bg-black">
        <h3 className="text-white mb-4 border-b border-gray-800 pb-2">Live Event Feed</h3>
        <div className="space-y-2 opacity-80 text-sm font-mono">
          {logs.map((log, i) => (
             <div key={i} className="text-green-400">{log}</div>
          ))}
          {logs.length === 0 && <div className="text-gray-600">Waiting for traffic...</div>}
        </div>
      </div>
    </div>
  );
}