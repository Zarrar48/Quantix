"use client";
import React, { useState, useMemo, useEffect } from "react";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { CandleData } from "@/services/dashboardService";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface MarketChartProps {
  data: Record<string, CandleData[]>;
  assetNames: Record<string, string>; 
}

export default function MarketChart({ data,assetNames }: MarketChartProps) {
  const symbols = Object.keys(data);
  
  const [activeSymbol, setActiveSymbol] = useState<string>(symbols[0] || "GC=F");
  useEffect(() => {
    if (symbols.length > 0 && !symbols.includes(activeSymbol)) {
      setActiveSymbol(symbols[0]);
    }
  }, [symbols, activeSymbol]);

  const activeData = data[activeSymbol] || [];
  const activeName = assetNames[activeSymbol] || activeSymbol;

  const currentCandle = activeData[activeData.length - 1];
  const currentPrice = currentCandle ? currentCandle.y[3] : 0; 
  const previousPrice = activeData.length > 1 ? activeData[activeData.length - 2].y[3] : 0;
  const isPositive = currentPrice >= previousPrice;

  const options: ApexOptions = {
    chart: {
      type: "candlestick", 
      fontFamily: "Satoshi, sans-serif",
      height: 350,
      toolbar: { show: false },
      zoom: { enabled: false },
      animations: { enabled: true },
    },
    plotOptions: {
      candlestick: {
        colors: {
          upward: "#10B981",   
          downward: "#EF4444", 
        },
        wick: { useFillColor: true },   
      },
       bar: {
        columnWidth: "50%",}
    },
    grid: {
      borderColor: "#334155",
      strokeDashArray: 4,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    xaxis: {
      type: "datetime", 
      tooltip: { enabled: false },
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: { colors: "#9ca3af", fontSize: "10px" },
        datetimeFormatter: { hour: 'HH:mm' }
      }
    },
    yaxis: {
      tooltip: { enabled: true },
      labels: {
        style: { colors: "#9ca3af" },
        formatter: (val) => val.toFixed(1),
      },
    },
    tooltip: {
      theme: "dark",
      x: { format: 'dd MMM HH:mm' } 
    },
  };

  const series = [{ 
    name: activeName,
    data: activeData 
  }];

  return (
    <div className="col-span-12 rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-7.5 shadow-default dark:border-gray-800 dark:bg-gray-900 sm:px-7.5">
      
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20">
            <span className="font-bold text-sm text-blue-600 dark:text-blue-400">
              {activeSymbol.substring(0, 2)}
            </span>
          </div>
          <div>
            <h4 className="text-xl font-bold text-black dark:text-white">
              {activeName} Analysis
            </h4>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-black dark:text-white">
                ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
              <span className={`text-sm font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {isPositive ? '▲' : '▼'}
                <span className="text-xs text-gray-400 font-normal uppercase">
                   ({activeSymbol})
                </span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
          {symbols.length > 0 ? (
            symbols.map((sym) => (
              <button
                key={sym}
                onClick={() => setActiveSymbol(sym)}
                className={`rounded-md px-4 py-1.5 text-xs font-bold transition-all ${
                  activeSymbol === sym
                    ? "bg-white text-black shadow-card dark:bg-gray-700 dark:text-white"
                    : "text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white"
                }`}
              >
                {sym}
              </button>
            ))
          ) : (
            <span className="px-4 py-1.5 text-xs text-gray-500">No Data</span>
          )}
        </div>
      </div>

      <div className="-ml-4 -mr-2">
        {activeData.length > 0 ? (
           <ReactApexChart 
             options={options} 
             series={series} 
             type="candlestick" 
             height={350} 
           />
        ) : (
           <div className="flex h-[350px] items-center justify-center text-gray-400">
             Waiting for market data...
           </div>
        )}
      </div>
    </div>
  );
}