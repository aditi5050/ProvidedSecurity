"use client";
import BuyButton from "@/components/BuyButton";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function FlashSalePage() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center bg-black overflow-hidden">
      <Link href="/" className="absolute top-8 left-8 text-gray-500 hover:text-white flex items-center gap-2 z-50">
        <ArrowLeft className="w-4 h-4" /> Back to Hub
      </Link>
      
      {/* BACKGROUND GRID */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,100,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,100,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
      
      <div className="relative z-10 w-full max-w-6xl px-4 flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 text-left space-y-6">
          <div className="inline-block border border-blue-500/30 bg-blue-500/10 px-3 py-1 rounded-full">
            <span className="text-xs font-mono text-blue-400 tracking-[0.2em]">FLASH SALE MODE</span>
          </div>
          <h1 className="text-6xl font-black text-white tracking-tighter">
            iPhone 15 <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">TITANIUM</span>
          </h1>
          <p className="text-gray-400 max-w-md text-lg">
            System active. Protected by Sentinel Proof-of-Work and Mouse Analysis.
          </p>
        </div>
        <div className="flex-1 flex justify-center perspective-1000">
          <BuyButton />
        </div>
      </div>
    </main>
  );
}