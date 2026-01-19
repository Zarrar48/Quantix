"use client";
import React, { useEffect, useState } from "react";
import { Zap, Clock, TrendingUp, TrendingDown } from "lucide-react";

interface SignalData {
  symbol: string;
  assetName: string;
  type: "BUY" | "SELL" | "WAIT" | "HOLD";
  price: number;
  strength: number;
  timestamp: string;
}

export default function SidebarWidget() {
  const [signal, setSignal] = useState<SignalData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/signals")
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setSignal(data);
        }
      })
      .catch((err) => console.error("Sidebar signal error:", err))
      .finally(() => setLoading(false));
  }, []);

  // Helper: Calculate "Time Ago" for authenticity
  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  // --- LOADING STATE ---
  if (loading) {
    return (
      <div className="mx-auto mb-10 w-full max-w-60 rounded-2xl bg-gray-50 px-4 py-5 text-center dark:bg-white/[0.03]">
        <div className="h-6 w-3/4 mx-auto mb-3 animate-pulse rounded bg-gray-200 dark:bg-gray-800"></div>
        <div className="h-4 w-1/2 mx-auto animate-pulse rounded bg-gray-200 dark:bg-gray-800"></div>
      </div>
    );
  }

  // --- NO SIGNAL STATE ---
  if (!signal) {
    return (
      <div className="mx-auto mb-10 w-full max-w-60 rounded-2xl bg-gray-50 px-4 py-5 text-center dark:bg-white/[0.03]">
        <div className="mb-3 flex justify-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20">
             <Zap className="h-5 w-5 text-blue-500" />
          </div>
        </div>
        <h3 className="mb-1 font-bold text-gray-900 dark:text-white">
          System Active
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Scanning markets for opportunities...
        </p>
      </div>
    );
  }

  // --- AUTHENTIC DATA LOGIC ---
  const isBuy = signal.type === "BUY";
  const isSell = signal.type === "SELL";
  const isNeutral = signal.type === "WAIT" || signal.type === "HOLD";

  let statusColor = "text-gray-500";
  let btnColor = "bg-gray-500";
  let icon = <Clock className="h-5 w-5" />;

  if (isBuy) {
    statusColor = "text-green-500";
    btnColor = "bg-green-500";
    icon = <TrendingUp className="h-5 w-5" />;
  } else if (isSell) {
    statusColor = "text-red-500";
    btnColor = "bg-red-500";
    icon = <TrendingDown className="h-5 w-5" />;
  }

  return (
    <div className="mx-auto mb-10 w-full max-w-60 rounded-2xl bg-gray-50 px-4 py-5 text-center dark:bg-white/[0.03] border border-gray-100 dark:border-gray-800 shadow-sm">
      
      {/* Header Badge */}
      <div className="flex items-center justify-center gap-2 mb-3">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
        </span>
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Latest Signal
        </h3>
      </div>

      {/* Asset Name & Price */}
      <div className="mb-4">
        <h4 className="text-lg font-bold text-black dark:text-white leading-tight">
          {signal.assetName}
        </h4>
        <span className="text-xs font-mono text-gray-400 mb-2 block">
          {signal.symbol}
        </span>

        {/* Dynamic Price Display */}
        <div className={`flex items-center justify-center gap-2 text-xl font-bold ${statusColor}`}>
          {icon}
          {signal.type}
        </div>
        
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
           @ <span className="font-mono font-medium text-black dark:text-white">
             ${signal.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
           </span>
        </p>
      </div>

      {/* Strength Bar */}
      <div className="mb-4 text-left">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-400">Confidence</span>
          <span className="font-bold text-black dark:text-white">{signal.strength}%</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
          <div 
            className={`h-1.5 rounded-full ${btnColor}`} 
            style={{ width: `${signal.strength}%` }}
          ></div>
        </div>
      </div>

      {/* Action Button */}
      <a
        href="/"
        className={`flex w-full items-center justify-center gap-2 rounded-lg p-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 ${btnColor}`}
      >
        View Chart
        <span className="text-white/70 text-xs font-normal border-l border-white/20 pl-2 ml-1">
          {getTimeAgo(signal.timestamp)}
        </span>
      </a>
    </div>
  );
}