"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function WaitingRoom() {
  const [status, setStatus] = useState("Connecting to Queue...");
  const router = useRouter();

  useEffect(() => {
    // 1. Connect to Waiting Room WebSocket
    const ws = new WebSocket("ws://localhost:8000/ws/waiting-room");

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.status === "waiting") {
        setStatus("⚠️ High Traffic Detected. You are in the Queue...");
      } 
      
      if (data.status === "ready") {
        setStatus("✅ You're next! Redirecting...");
        // Save the "Pass Token"
        localStorage.setItem("queue_token", data.token);
        setTimeout(() => router.push("/"), 1000);
      }
    };

    return () => ws.close();
  }, [router]);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white font-mono p-4 text-center">
      <div className="animate-pulse mb-8 text-6xl">⏳</div>
      <h1 className="text-3xl font-bold mb-4">VIRTUAL WAITING ROOM</h1>
      <p className="text-gray-400 mb-8 max-w-md">{status}</p>
      <div className="w-64 h-2 bg-gray-800 rounded-full overflow-hidden">
        <div className="h-full bg-blue-500 animate-[pulse_2s_ease-in-out_infinite] w-1/2 mx-auto"></div>
      </div>
      <p className="mt-8 text-xs text-gray-600">Don't refresh. We are filtering bots.</p>
    </div>
  );
}