"use client";
import React from "react";
import { useDashboard } from "@/hooks/useDashboard";
import TradingMetrics from "@/components/dashboard/TradingMetrics"; 
import MarketChart from "@/components/dashboard/MarketChart";    
import RecentSignals from "@/components/dashboard/RecentSignals";
import { Activity, Clock, Database } from "lucide-react";

export default function TradingDashboard() {
  const { loading, metrics, signals, chartData, assetNames } = useDashboard();

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6 2xl:gap-7.5">
      
      <div className="col-span-12">
        {loading || !metrics ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6 xl:grid-cols-3 2xl:gap-7.5">
             {[1, 2, 3].map((i) => (
               <div key={i} className="h-24 animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-800" />
             ))}
          </div>
        ) : (
          <TradingMetrics data={metrics} />
        )}
      </div>

      <div className="col-span-12 xl:col-span-8">
        {loading ? (
          <div className="h-[350px] w-full animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-800" />
        ) : (
          <MarketChart data={chartData} assetNames={assetNames} />
        )}
      </div>

 <div className="col-span-12 xl:col-span-4">
        <div className="flex h-full flex-col justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-default dark:border-gray-800 dark:bg-gray-900">
          <div>
            <h3 className="mb-6 text-xl font-bold text-black dark:text-white flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-500" />
              Bot Status
            </h3>

            <div className="flex flex-col gap-4">
              
              <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                <div className="flex items-center gap-3">
                  <Activity className="h-5 w-5 text-orange-500" />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    24h Signals
                  </span>
                </div>
                <span className="font-bold text-black dark:text-white">
                  {loading ? "..." : metrics?.dailySignalCount} 
                  <span className="text-xs font-normal text-gray-500 ml-1">generated</span>
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-purple-500" />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Last Heartbeat
                  </span>
                </div>
                <div className="text-right">
                  <span className="block font-bold text-black dark:text-white">
                    {loading ? "..." : new Date(metrics?.lastUpdate || "").toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
              </div>

            </div>
          </div>

          <div className="mt-6">
            <div className={`flex w-full items-center justify-center gap-2 rounded-lg py-3 text-white font-bold transition-all ${
              metrics?.systemStatus === "Operational" 
                ? "bg-green-500 shadow-lg shadow-green-500/20" 
                : "bg-red-500 shadow-lg shadow-red-500/20"
            }`}>
              <span className={`h-2.5 w-2.5 rounded-full bg-white ${
                 metrics?.systemStatus === "Operational" ? "animate-pulse" : "" 
              }`}></span>
              {metrics?.systemStatus || "Connecting..."}
            </div>
            <p className="mt-3 text-center text-xs text-gray-400">
              {metrics?.systemStatus === "Operational" 
                ? "Engine is running normally. Scanning markets." 
                : "Engine has stopped. Check logs immediately."}
            </p>
          </div>
        </div>
      </div>

      <div className="col-span-12">
        {loading ? (
          <div className="h-[400px] w-full animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-800" />
        ) : (
          <RecentSignals signals={signals} />
        )}
      </div>
    </div>
  );
}