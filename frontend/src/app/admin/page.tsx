"use client";
import React, { useState, useEffect } from "react";
import { ShieldAlert, Package, Users, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ stock: 0, bots: 0, queue: 0 });
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8000/ws");
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      setStats(data);
      // Create a live timeline for the chart
      setHistory(prev => [...prev.slice(-10), { time: new Date().toLocaleTimeString(), bots: data.bots }]);
    };
    return () => ws.close();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-8 font-mono">
      <h1 className="text-3xl font-black mb-8 border-b border-gray-800 pb-4 text-blue-500">SENTINEL_COMMAND_CENTER v2.0</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-900 p-6 rounded-2xl border border-blue-500/20">
          <Package className="text-blue-500 mb-2" />
          <p className="text-gray-500 text-xs">INVENTORY_REMAINING</p>
          <p className="text-4xl font-bold">{stats.stock}</p>
        </div>
        <div className="bg-gray-900 p-6 rounded-2xl border border-red-500/20">
          <ShieldAlert className="text-red-500 mb-2" />
          <p className="text-gray-500 text-xs">THREATS_NEUTRALIZED</p>
          <p className="text-4xl font-bold text-red-500">{stats.bots}</p>
        </div>
        <div className="bg-gray-900 p-6 rounded-2xl border border-orange-500/20">
          <Activity className="text-orange-500 mb-2" />
          <p className="text-gray-500 text-xs">QUEUE_BACKLOG</p>
          <p className="text-4xl font-bold">{stats.queue}</p>
        </div>
      </div>

      <div className="bg-gray-900 p-8 rounded-3xl border border-gray-800 h-64">
        <p className="text-xs text-gray-500 mb-4">REALTIME_THREAT_ANALYSIS</p>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={history}>
            <Bar dataKey="bots" fill="#ef4444" radius={[4, 4, 0, 0]} />
            <XAxis dataKey="time" hide />
            <Tooltip contentStyle={{backgroundColor: '#111', border: 'none'}} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}