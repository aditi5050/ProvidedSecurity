"use client";
import Link from "next/link";
import { Shield, ShoppingCart, Video, Zap } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,150,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,150,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] opacity-30" />
      <div className="absolute top-0 w-full h-32 bg-gradient-to-b from-blue-900/20 to-transparent" />

      <div className="z-10 text-center space-y-8 max-w-4xl px-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-900/30 border border-blue-500/50 text-blue-400 font-mono text-sm tracking-widest animate-pulse">
          <Shield className="w-4 h-4" /> SENTINEL SYSTEM ACTIVE
        </div>

        <h1 className="text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-200 to-gray-500">
          CHOOSE YOUR <br /> DEFENSE SCENARIO
        </h1>

        <div className="grid md:grid-cols-2 gap-6 mt-12">
          {/* OPTION 1: FLASH SALE */}
          <Link href="/flash-sale" className="group relative block p-8 rounded-3xl bg-gray-900/50 border border-gray-800 hover:border-blue-500 transition-all hover:scale-[1.02] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10 flex flex-col items-center gap-4">
              <div className="p-4 rounded-full bg-blue-600/20 text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <ShoppingCart className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold">Quick Commerce Defense</h2>
              <p className="text-gray-400 text-sm text-center">
                Protect "High Heat" product launches from scalper bots. 
                Features: <span className="text-white">Fair Queueing, Inventory Locking, PoW.</span>
              </p>
            </div>
          </Link>

          {/* OPTION 2: CREATOR SHIELD */}
          <Link href="/creator-defense" className="group relative block p-8 rounded-3xl bg-gray-900/50 border border-gray-800 hover:border-purple-500 transition-all hover:scale-[1.02] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10 flex flex-col items-center gap-4">
              <div className="p-4 rounded-full bg-purple-600/20 text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <Video className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold">Creator Shield</h2>
              <p className="text-gray-400 text-sm text-center">
                Stop "View Bot" attacks that ban channels. 
                Features: <span className="text-white">Traffic Analysis, IP Reputation, Fake View Filtering.</span>
              </p>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}