"use client";
import React, { useEffect, useState } from "react";
import { 
  Zap, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownRight,
  Activity,
  ChevronRight
} from "lucide-react";

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

  // --- SKELETON LOADER ---
  if (loading) {
    return (
      <div className="mx-auto mb-10 w-full max-w-[280px] overflow-hidden rounded-3xl border border-gray-100 bg-white p-5 shadow-lg dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-4 flex items-center justify-between">
          <div className="h-3 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-800"></div>
          <div className="h-3 w-10 animate-pulse rounded bg-gray-200 dark:bg-gray-800"></div>
        </div>
        <div className="mb-4 h-12 w-full animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800"></div>
        <div className="space-y-2">
          <div className="h-8 w-full animate-pulse rounded bg-gray-100 dark:bg-gray-800"></div>
          <div className="h-8 w-full animate-pulse rounded bg-gray-100 dark:bg-gray-800"></div>
        </div>
      </div>
    );
  }

  // --- EMPTY STATE ---
  if (!signal) {
    return (
      <div className="mx-auto mb-10 w-full max-w-[280px] rounded-3xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center dark:border-gray-700 dark:bg-gray-900/50">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
          <Activity className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">Scanning Market</h3>
        <p className="mt-1 text-xs text-gray-500">Waiting for high-confidence setup...</p>
      </div>
    );
  }

  // --- STYLING LOGIC ---
  const isBuy = signal.type === "BUY";
  const isSell = signal.type === "SELL";

  const theme = {
    gradient: isBuy 
      ? "from-emerald-500 to-teal-600 shadow-emerald-500/20" 
      : isSell 
        ? "from-rose-500 to-orange-600 shadow-rose-500/20" 
        : "from-gray-500 to-slate-600 shadow-gray-500/20",
    bgLight: isBuy ? "bg-emerald-50 dark:bg-emerald-900/10" : isSell ? "bg-rose-50 dark:bg-rose-900/10" : "bg-gray-50",
    text: isBuy ? "text-emerald-700 dark:text-emerald-400" : isSell ? "text-rose-700 dark:text-rose-400" : "text-gray-600",
    icon: isBuy ? <ArrowUpRight className="h-5 w-5" /> : isSell ? <ArrowDownRight className="h-5 w-5" /> : <Clock className="h-5 w-5" />
  };

  return (
    <div className="relative mx-auto mb-10 w-full max-w-[280px] rounded-3xl border border-gray-100 bg-white shadow-xl shadow-gray-200/50 dark:border-gray-800 dark:bg-gray-900 dark:shadow-black/30 transition-all hover:-translate-y-1 hover:shadow-2xl">
      
      {/* 1. Header: Status & Time */}
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3 dark:border-gray-800">
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${isBuy ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
            <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${isBuy ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Live Signal</span>
        </div>
        <span className="text-[10px] font-medium text-gray-400">{getTimeAgo(signal.timestamp)}</span>
      </div>

      {/* 2. Main Body */}
      <div className="px-5 py-5">
        
        {/* Asset Header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h4 className="text-lg font-extrabold text-gray-900 dark:text-white leading-tight">
              {signal.assetName}
            </h4>
            <span className="text-xs font-semibold text-gray-400">{signal.symbol}</span>
          </div>
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${theme.gradient} text-white shadow-lg`}>
             {isBuy ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
          </div>
        </div>

        {/* The Signal Badge */}
        <div className={`mb-5 flex items-center justify-between rounded-xl p-3 ${theme.bgLight} border border-transparent dark:border-white/5`}>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-gray-400">Action</span>
            <span className={`text-xl font-black tracking-tight ${theme.text}`}>
              {signal.type}
            </span>
          </div>
          <div className="text-right">
             <span className="text-[10px] uppercase font-bold text-gray-400">Entry</span>
             <span className="block font-mono text-lg font-bold text-gray-900 dark:text-white">
               ${signal.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
             </span>
          </div>
        </div>

        {/* Strength Meter */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-gray-500">Strength</span>
            <span className={theme.text}>{signal.strength}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
            <div 
              className={`h-full rounded-full bg-gradient-to-r ${theme.gradient} transition-all duration-500 ease-out`} 
              style={{ width: `${signal.strength}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* 3. Footer Action */}
      <a
        href="#"
        className="group relative flex w-full items-center justify-center gap-2 bg-gray-50 py-3 text-xs font-bold uppercase tracking-wide text-gray-600 transition-colors hover:bg-gray-100 dark:bg-gray-800/50 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        View Chart Analysis
        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </a>
    </div>
  );
}