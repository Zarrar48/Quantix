"use client";
import React, { useEffect, useState, useRef } from "react";
import { 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  Activity,
  ChevronRight,
  RefreshCw,
  Clock
} from "lucide-react";

interface SignalData {
  symbol: string;
  assetName: string;
  type: "BUY" | "SELL" | "WAIT" | "HOLD";
  price: number;
  strength: number;
  timestamp: string;
  reason?: string;
}

export default function SidebarWidget() {
  const [signal, setSignal] = useState<SignalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNewUpdate, setIsNewUpdate] = useState(false);
  const lastTimestamp = useRef<string | null>(null);

  // --- POLLING LOGIC ---
  const fetchSignal = async () => {
    try {
      // Add a timestamp param to prevent browser caching
      const res = await fetch(`/api/signals?t=${Date.now()}`);
      const data = await res.json();

      if (data && !data.error) {
        // Check if this is actually a new signal based on timestamp
        if (lastTimestamp.current && lastTimestamp.current !== data.timestamp) {
          setIsNewUpdate(true);
          setTimeout(() => setIsNewUpdate(false), 2000); // Reset flash after 2s
        }
        lastTimestamp.current = data.timestamp;
        setSignal(data);
      }
    } catch (err) {
      console.error("Signal fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSignal(); // Initial load
    const interval = setInterval(fetchSignal, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  // --- TIME FORMATTER ---
  const getTimeDisplay = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // --- SKELETON LOADER ---
  if (loading) {
    return (
      <div className="w-full max-w-[280px] rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900/50">
        <div className="flex items-center justify-between mb-4">
          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse dark:bg-gray-800"></div>
          <div className="h-4 w-8 bg-gray-200 rounded animate-pulse dark:bg-gray-800"></div>
        </div>
        <div className="h-10 w-full bg-gray-100 rounded-lg animate-pulse mb-3 dark:bg-gray-800"></div>
        <div className="h-20 w-full bg-gray-50 rounded-lg animate-pulse dark:bg-gray-800/50"></div>
      </div>
    );
  }

  // --- EMPTY STATE ---
  if (!signal) {
    return (
      <div className="w-full max-w-[280px] rounded-2xl border border-dashed border-gray-300 bg-gray-50/50 p-6 text-center dark:border-gray-700 dark:bg-gray-900/20">
        <RefreshCw className="mx-auto mb-3 h-5 w-5 animate-spin text-gray-400" />
        <p className="text-xs font-medium text-gray-500">Scanning Market...</p>
      </div>
    );
  }

  // --- THEME LOGIC ---
  const isBuy = signal.type === "BUY";
  const isSell = signal.type === "SELL";
  
  // Dynamic colors based on signal type
  const colors = {
    bg: isBuy ? "bg-emerald-500" : isSell ? "bg-rose-500" : "bg-gray-500",
    bgSoft: isBuy ? "bg-emerald-500/10" : isSell ? "bg-rose-500/10" : "bg-gray-500/10",
    text: isBuy ? "text-emerald-600" : isSell ? "text-rose-600" : "text-gray-600",
    textDark: isBuy ? "dark:text-emerald-400" : isSell ? "dark:text-rose-400" : "dark:text-gray-400",
    border: isBuy ? "border-emerald-200 dark:border-emerald-500/30" : isSell ? "border-rose-200 dark:border-rose-500/30" : "border-gray-200",
    gradient: isBuy 
      ? "from-emerald-500 to-teal-600" 
      : isSell 
        ? "from-rose-500 to-red-600" 
        : "from-gray-500 to-slate-600"
  };

  return (
    <div className={`relative w-full max-w-[280px] overflow-hidden rounded-2xl border bg-white shadow-xl shadow-gray-200/50 transition-all duration-500 dark:bg-gray-900 dark:shadow-none ${isNewUpdate ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900' : 'ring-0'} ${colors.border}`}>
      
      {/* HEADER */}
      <div className="relative flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
           {/* Pulsing Dot */}
          <span className="relative flex h-2 w-2">
            <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${colors.bg}`}></span>
            <span className={`relative inline-flex h-2 w-2 rounded-full ${colors.bg}`}></span>
          </span>
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Smart Signal
          </span>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-medium text-gray-400">
          <Clock className="h-3 w-3" />
          {getTimeDisplay(signal.timestamp)}
        </div>
      </div>

      {/* BODY */}
      <div className="p-4">
        {/* Asset Info */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
              {signal.assetName}
            </h3>
            <div className="flex items-center gap-1.5">
              <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                {signal.symbol}
              </span>
            </div>
          </div>
          
          {/* Signal Icon Circle */}
          <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${colors.gradient} text-white shadow-lg`}>
            {isBuy ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
          </div>
        </div>

        {/* Main Price Box */}
        <div className={`mb-4 flex items-center justify-between rounded-xl border border-dashed border-transparent bg-gray-50 p-3 dark:bg-gray-800/50 ${colors.bgSoft}`}>
          <div>
            <p className={`text-[10px] font-bold uppercase ${colors.text} ${colors.textDark}`}>
              Signal
            </p>
            <p className={`text-xl font-black tracking-tight ${colors.text} ${colors.textDark}`}>
              {signal.type}
            </p>
          </div>
          <div className="text-right">
             <p className="text-[10px] font-bold uppercase text-gray-400">Entry Zone</p>
             <p className="font-mono text-lg font-bold text-gray-900 dark:text-white">
               ${signal.price.toLocaleString()}
             </p>
          </div>
        </div>

        {/* Confidence Meter */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] font-medium">
            <span className="text-gray-500">Confidence Score</span>
            <span className={colors.text + " " + colors.textDark}>{signal.strength}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
            <div 
              className={`h-full rounded-full bg-gradient-to-r ${colors.gradient} transition-all duration-700 ease-out`} 
              style={{ width: `${signal.strength}%` }}
            />
          </div>
        </div>
      </div>

      {/* FOOTER BUTTON */}
      <button className="flex w-full items-center justify-center gap-1 border-t border-gray-100 bg-gray-50 py-2.5 text-[11px] font-bold uppercase tracking-wide text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:border-gray-800 dark:bg-gray-900/30 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white">
        Analyze Chart <ChevronRight className="h-3 w-3" />
      </button>
    </div>
  );
}