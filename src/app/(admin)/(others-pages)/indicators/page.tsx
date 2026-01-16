'use client';

import React, { useState, useEffect } from 'react';
import {
    Activity, Calendar, ChevronLeft, ChevronRight, Filter
} from 'lucide-react';
import SymbolSelector from '@/components/SymbolSelector';

// Types
interface Indicator {
    id: number;
    symbol: string;
    timestamp: string;
    rsi_14: string;
    macd_line: string;
    macd_signal: string;
    ema_50: string;
    ema_200: string;
    bb_upper: string | null;
    bb_lower: string | null;
    atr: string | null;
    volume: string | null;
}

interface Pagination {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

const TechnicalIndicatorsPage = () => {
    const [indicators, setIndicators] = useState<Indicator[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [loading, setLoading] = useState(true);

    const [selectedSymbol, setSelectedSymbol] = useState('ALL');
    const [currentPage, setCurrentPage] = useState(1);

    const fetchIndicators = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: '20',
                symbol: selectedSymbol
            });

            const res = await fetch(`/api/indicators?${params}`);
            if (res.ok) {
                const data = await res.json();
                setIndicators(data.data);
                setPagination(data.pagination);
            }
        } catch (error) {
            console.error("Failed to load indicators", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIndicators();
    }, [currentPage, selectedSymbol]);

    // Helpers
    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleString('en-US', {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    const formatNum = (val: string | null) =>
        val ? parseFloat(val).toFixed(2) : '-';

    return (
        <div className="p-6 min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                        <Activity className="text-purple-500" /> Technical Indicators
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        Computed technical analysis values (RSI, MACD, EMA) for each candle.
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

            {/* Table */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-slate-400 animate-pulse">Loading analysis data...</div>
                ) : indicators.length === 0 ? (
                    <div className="p-12 text-center text-slate-400">No technical data found.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 uppercase font-semibold text-xs border-b border-slate-200 dark:border-slate-700">
                                <tr>
                                    <th className="px-6 py-4">Symbol</th>
                                    <th className="px-6 py-4">Timestamp</th>
                                    <th className="px-6 py-4 text-right">Volume</th>
                                    <th className="px-6 py-4 text-center">RSI (14)</th>
                                    <th className="px-6 py-4 text-center">MACD</th>
                                    <th className="px-6 py-4 text-right">EMA 50</th>
                                    <th className="px-6 py-4 text-right">EMA 200</th>
                                    <th className="px-6 py-4 text-right">Bollinger Bands</th>
                                    <th className="px-6 py-4 text-right">ATR</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                {indicators.map((ind) => {
                                    const rsiVal = parseFloat(ind.rsi_14);
                                    return (
                                        <tr key={ind.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                            <td className="px-6 py-4 font-bold font-mono text-purple-600 dark:text-purple-400">
                                                {ind.symbol}
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 flex items-center gap-2">
                                                <Calendar size={14} />
                                                {formatDate(ind.timestamp)}
                                            </td>
                                            <td className="px-6 py-4 text-right font-mono text-slate-600 dark:text-slate-400">
                                                {ind.volume ? parseInt(ind.volume).toLocaleString() : '-'}
                                            </td>
                                            {/* RSI with color coding */}
                                            <td className="px-6 py-4 text-center font-mono font-medium">
                                                <span className={`px-2 py-1 rounded text-xs ${rsiVal > 70 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                    rsiVal < 30 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                                        'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                                                    }`}>
                                                    {formatNum(ind.rsi_14)}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4 text-center font-mono text-xs text-slate-600 dark:text-slate-300">
                                                <div>L: <span className="text-slate-900 dark:text-white">{formatNum(ind.macd_line)}</span></div>
                                                <div className="text-slate-400">S: {formatNum(ind.macd_signal)}</div>
                                            </td>

                                            <td className="px-6 py-4 text-right font-mono text-amber-600 dark:text-amber-500">
                                                {formatNum(ind.ema_50)}
                                            </td>
                                            <td className="px-6 py-4 text-right font-mono text-blue-600 dark:text-blue-400">
                                                {formatNum(ind.ema_200)}
                                            </td>
                                            <td className="px-6 py-4 text-right font-mono text-xs text-slate-500">
                                                <span className="block">U: {formatNum(ind.bb_upper)}</span>
                                                <span className="block">L: {formatNum(ind.bb_lower)}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right font-mono text-slate-600 dark:text-slate-400">
                                                {formatNum(ind.atr)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {pagination && (
                    <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                        <span className="text-xs text-slate-500">
                            Page <strong>{pagination.page}</strong> of <strong>{pagination.totalPages}</strong>
                        </span>
                        <div className="flex gap-2">
                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <button
                                disabled={currentPage >= pagination.totalPages}
                                onClick={() => setCurrentPage(p => p + 1)}
                                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors"
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

export default TechnicalIndicatorsPage;