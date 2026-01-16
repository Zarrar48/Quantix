'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart2, Search, Calendar, ChevronLeft, ChevronRight, Filter 
} from 'lucide-react';
import SymbolSelector from '@/components/SymbolSelector';

// Types
interface Candle {
  id: number;
  symbol: string;
  timestamp: string;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string | null;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const MarketCandlesPage = () => {
  const [candles, setCandles] = useState<Candle[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [selectedSymbol, setSelectedSymbol] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  const fetchCandles = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20', 
        symbol: selectedSymbol
      });
      
      const res = await fetch(`/api/candles?${params}`);
      if (res.ok) {
        const data = await res.json();
        setCandles(data.data);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Failed to load candles", error);
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch when page or filter changes
  useEffect(() => {
    fetchCandles();
  }, [currentPage, selectedSymbol]);

  // Helpers
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const formatPrice = (val: string) => 
    val ? parseFloat(val).toFixed(2) : '-';

  return (
    <div className="p-6 min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <BarChart2 className="text-indigo-500" /> Market Candles
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Historical price data (OHLC) recorded by the trading bot.
          </p>
        </div>

        <div className="z-10"> 
                    <SymbolSelector 
                        selected={selectedSymbol} 
                        onSelect={(sym) => {
                            setSelectedSymbol(sym);
                            setCurrentPage(1); 
                        }} 
                    />
                </div>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 animate-pulse">Loading market data...</div>
        ) : candles.length === 0 ? (
          <div className="p-12 text-center text-slate-400">No candle data found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 uppercase font-semibold text-xs border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-4">Symbol</th>
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4 text-right">Open</th>
                  <th className="px-6 py-4 text-right">High</th>
                  <th className="px-6 py-4 text-right">Low</th>
                  <th className="px-6 py-4 text-right">Close</th>
                  <th className="px-6 py-4 text-right">Volume</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {candles.map((candle) => (
                  <tr key={`${candle.id}-${candle.symbol}`} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4 font-bold font-mono text-indigo-600 dark:text-indigo-400">
                      {candle.symbol}
                    </td>
                    <td className="px-6 py-4 text-slate-500 flex items-center gap-2">
                      <Calendar size={14} />
                      {formatDate(candle.timestamp)}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-slate-600 dark:text-slate-300">
                      {formatPrice(candle.open)}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-emerald-600">
                      {formatPrice(candle.high)}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-red-500">
                      {formatPrice(candle.low)}
                    </td>
                    <td className="px-6 py-4 text-right font-bold font-mono">
                      {formatPrice(candle.close)}
                    </td>
                    <td className="px-6 py-4 text-right text-slate-400">
                      {candle.volume || '---'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {pagination && (
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
            <span className="text-xs text-slate-500">
              Page <strong>{pagination.page}</strong> of <strong>{pagination.totalPages}</strong> 
              {' '}(Total: {pagination.total})
            </span>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                disabled={currentPage >= pagination.totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketCandlesPage;