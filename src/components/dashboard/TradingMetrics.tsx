import React from "react";
import { Activity, Server, Zap, Clock } from "lucide-react";
import { TradingMetrics as ITradingMetrics } from "@/services/dashboardService";

export default function TradingMetrics({ data }: { data: ITradingMetrics }) {
    
  const isBuy = data.latestSignal.type === "BUY";
  const isSell = data.latestSignal.type === "SELL";
  const isNeutral = data.latestSignal.type === "WAIT" || data.latestSignal.type === "HOLD";

  let signalIconColor = "text-gray-400";
  let signalBgColor = "bg-gray-100 dark:bg-gray-800";
  let progressBarColor = "bg-gray-400";

  if (isBuy) {
    signalIconColor = "text-green-600";
    signalBgColor = "bg-green-50 dark:bg-green-900/20";
    progressBarColor = "bg-green-500";
  } else if (isSell) {
    signalIconColor = "text-red-600";
    signalBgColor = "bg-red-50 dark:bg-red-900/20";
    progressBarColor = "bg-red-500";
  } else if (!isNeutral && data.latestSignal.strength > 0) {
     progressBarColor = "bg-yellow-500";
  }

  const isSystemCritical = data.systemStatus !== "Operational";

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6 xl:grid-cols-3 2xl:gap-7.5">
      
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-default dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-medium text-gray-500">Active Assets</span>
            <h4 className="mt-1 text-2xl font-bold text-black dark:text-white">
              {data.activeAssets}
            </h4>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20">
            <Activity className="h-6 w-6 text-blue-600" />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-1">
          {data.activeAssets > 0 ? (
            <>
               <span className="relative flex h-2 w-2 mr-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-xs text-green-500">Live Scanning</span>
            </>
          ) : (
             <span className="text-xs text-gray-400">No assets configured</span>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-default dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-medium text-gray-500">
              Signal ({data.latestSignal.symbol || "N/A"}) 
            </span>
            <h4 className="mt-1 text-2xl font-bold text-black dark:text-white">
              {data.latestSignal.strength}%
            </h4>
          </div>
          <div className={`flex h-11 w-11 items-center justify-center rounded-full ${signalBgColor}`}>
            <Zap className={`h-6 w-6 ${signalIconColor}`} />
          </div>
        </div>
        
        <div className="mt-4 h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-700">
          <div 
            className={`h-1.5 rounded-full transition-all duration-500 ${progressBarColor}`}
            style={{ width: `${data.latestSignal.strength}%` }}
          />
        </div>
        
        <div className="mt-2 text-xs font-medium text-gray-400">
          Action: <span className={isNeutral ? "text-gray-500" : (isBuy ? "text-green-500" : "text-red-500")}>
            {data.latestSignal.type}
          </span>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-default dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-medium text-gray-500">System Status</span>
            <h4 className={`mt-1 text-2xl font-bold ${
              isSystemCritical ? "text-red-500" : "text-green-500"
            }`}>
              {data.systemStatus}
            </h4>
          </div>
          <div className={`flex h-11 w-11 items-center justify-center rounded-full ${
             isSystemCritical ? "bg-red-50 dark:bg-red-900/20" : "bg-green-50 dark:bg-green-900/20"
          }`}>
            <Server className={`h-6 w-6 ${isSystemCritical ? "text-red-600" : "text-green-600"}`} />
          </div>
        </div>
        
        <div className="mt-4 flex items-center gap-1 text-xs text-gray-400">
           <Clock className="h-3 w-3" />
           <span>Last Check:</span>
           <span className="text-gray-800 dark:text-white">
             {data.lastUpdate 
               ? new Date(data.lastUpdate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) 
               : "Connecting..."}
           </span>
        </div>
      </div>

    </div>
  );
}