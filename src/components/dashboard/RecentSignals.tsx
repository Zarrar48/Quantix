import React from "react";
import { Signal } from "@/services/dashboardService";
import { ArrowUpRight, ArrowDownRight, Clock, AlertCircle } from "lucide-react";

interface RecentSignalsProps {
  signals: Signal[];
}

export default function RecentSignals({ signals }: RecentSignalsProps) {
  return (
    <div className="col-span-12 rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-7.5 shadow-default dark:border-gray-800 dark:bg-gray-900 sm:px-7.5">
      
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h4 className="text-xl font-bold text-black dark:text-white">
          Live Trade Signals
        </h4>
        <div className="flex items-center gap-2">
           <span className="flex h-2 w-2 relative">
             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
             <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
           </span>
           <span className="text-xs font-medium text-gray-500">Live Feed</span>
        </div>
      </div>

      <div className="flex flex-col">
        <div className="grid grid-cols-3 rounded-sm bg-gray-2 dark:bg-meta-4 sm:grid-cols-5">
          <div className="p-2.5 xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base text-gray-500 dark:text-gray-400">
              Asset
            </h5>
          </div>
          <div className="p-2.5 text-center xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base text-gray-500 dark:text-gray-400">
              Signal
            </h5>
          </div>
          <div className="p-2.5 text-center xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base text-gray-500 dark:text-gray-400">
              Price
            </h5>
          </div>
          <div className="hidden p-2.5 text-center sm:block xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base text-gray-500 dark:text-gray-400">
              Confidence
            </h5>
          </div>
          <div className="hidden p-2.5 text-center sm:block xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base text-gray-500 dark:text-gray-400">
              Reason
            </h5>
          </div>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {signals.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No signals generated yet. Waiting for bot...
            </div>
          ) : (
            signals.map((signal, key) => (
              <div
                className={`grid grid-cols-3 sm:grid-cols-5 ${
                  key === signals.length - 1 ? "" : "border-b border-stroke dark:border-strokedark"
                }`}
                key={signal.id}
              >
                <div className="flex items-center gap-3 p-2.5 xl:p-5">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-bold">
                      {signal.symbol.substring(0, 2)}
                    </div>
                  </div>
                  <p className="hidden font-bold text-black dark:text-white sm:block">
                    {signal.symbol}
                  </p>
                </div>

                <div className="flex items-center justify-center p-2.5 xl:p-5">
                  <span
                    className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
                      signal.type === "BUY"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    }`}
                  >
                    {signal.type === "BUY" ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" />
                    )}
                    {signal.type}
                  </span>
                </div>

                <div className="flex items-center justify-center p-2.5 xl:p-5">
                  <p className="font-mono text-black dark:text-white">
                    ${signal.price.toFixed(2)}
                  </p>
                </div>

                <div className="hidden items-center justify-center p-2.5 sm:flex xl:p-5">
                  <div className="w-full max-w-[100px]">
                    <div className="mb-1 flex justify-between">
                       <span className="text-xs font-medium text-gray-500">{signal.strength}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                      <div
                        className={`h-1.5 rounded-full ${
                          signal.strength > 75 ? "bg-green-500" : "bg-yellow-500"
                        }`}
                        style={{ width: `${signal.strength}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="hidden items-center p-2.5 sm:flex xl:p-5">
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <AlertCircle className="h-4 w-4" />
                    <span className="truncate max-w-[150px]" title={signal.reason}>
                      {signal.reason}
                    </span>
                  </div>
                  <div className="ml-auto flex items-center gap-1 text-[10px] text-gray-400">
                    <Clock className="h-3 w-3" />
                    {new Date(signal.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}