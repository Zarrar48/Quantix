'use client';

import React, { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine, Cell
} from 'recharts';
import {
    ArrowUpRight, ArrowDownRight, Activity, RefreshCw,
    Zap, Droplets, Hammer, AlertCircle, Search, ChevronLeft, ChevronRight
} from 'lucide-react';

// Data Interface
interface MarketData {
    symbol: string;
    name: string;
    asset_type: string;
    price: string;
    high: string;
    low: string;
    last_updated: string;
    rsi_14: string;
    macd_line: string;
    macd_signal: string;
    ema_50: string;
    active_signal: string | null;
    signal_strength: number | null;
    signal_reason: string | null;
}

const AnalysisPage = () => {
    const [data, setData] = useState<MarketData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filterType, setFilterType] = useState('ALL');
    const [lastRefreshed, setLastRefreshed] = useState(new Date());

    // --- Pagination State ---
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5; // Change this number to show more/less rows

    // Fetch Data Function
    const fetchData = async () => {
        try {
            const res = await fetch('/api/analysis');
            if (!res.ok) throw new Error(`Server Error: ${res.status}`);
            const json = await res.json();
            setData(json);
            setLastRefreshed(new Date());
            setError('');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Initial Load & Polling
    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    // Reset to page 1 when filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [filterType]);

    // Filter Logic
    const filteredData = data.filter(item =>
        filterType === 'ALL' ? true : item.asset_type === filterType
    );

    // --- Pagination Logic ---
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentData = filteredData.slice(startIndex, startIndex + itemsPerPage);

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
    };

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(prev => prev - 1);
    };

    // Helper: Format Numbers
    const fmtPrice = (p: string) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parseFloat(p || '0'));

    const fmtNum = (n: string) => parseFloat(n || '0').toFixed(2);

    // Helper: Visual Helpers
    const getRsiColor = (val: number) => {
        if (val >= 70) return '#ef4444'; // Red (Overbought)
        if (val <= 30) return '#10b981'; // Green (Oversold)
        return '#6366f1'; // Indigo (Neutral)
    };

    if (error) return (
        <div className="p-10 flex flex-col items-center justify-center text-red-500">
            <AlertCircle size={48} className="mb-4" />
            <h2 className="text-xl font-bold">Data Stream Error</h2>
            <p>{error}</p>
            <button onClick={fetchData} className="mt-4 px-4 py-2 bg-red-100 rounded-lg hover:bg-red-200">Retry Connection</button>
        </div>
    );

    return (
        <div className="p-6 bg-slate-50 dark:bg-slate-900 min-h-screen space-y-6">

            {/* 1. Header & Controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Activity className="text-indigo-500" /> Market Analysis Dashboard
                    </h1>
                    <p className="text-sm text-slate-500">
                        Live multi-asset technical surveillance • Last update: {lastRefreshed.toLocaleTimeString()}
                    </p>
                </div>

                <div className="flex items-center gap-3 bg-white dark:bg-slate-800 p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                    {['ALL', 'ENERGY', 'METAL', 'AGRI'].map(type => (
                        <button
                            key={type}
                            onClick={() => setFilterType(type)}
                            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${filterType === type
                                    ? 'bg-indigo-500 text-white shadow'
                                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'
                                }`}
                        >
                            {type}
                        </button>
                    ))}
                    <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>
                    <button onClick={fetchData} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-500">
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* 2. Visual Analytics Section (Charts) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Chart 1: RSI Heatmap */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4">RSI Momentum (14-Period)</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={filteredData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="symbol" tick={{ fontSize: 12 }} />
                                <YAxis domain={[0, 100]} />
                                <RechartsTooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <ReferenceLine
                                    y={70}
                                    stroke="#f59e0b" 
                                    strokeDasharray="3 3"
                                    strokeWidth={2}
                                    label={{
                                        value: 'Overbought',
                                        fill: '#9b3a3a',
                                        fontSize: 18,
                                        fontWeight: 'bold',
                                        dy: -8
                                    }}
                                />

                                <ReferenceLine
                                    y={30}
                                    stroke="#3b82f6" 
                                    strokeDasharray="3 3"
                                    strokeWidth={2}
                                    label={{
                                        value: 'Oversold',
                                        fill: '#9b3a3a', 
                                        fontSize: 18,
                                        fontWeight: 'bold',
                                    }}
                                />
                                <Bar dataKey="rsi_14" name="RSI Value" radius={[4, 4, 0, 0]}>
                                    {filteredData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={getRsiColor(parseFloat(entry.rsi_14))} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Chart 2: Active Signals Summary */}
                <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col h-[340px]">
                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4">Top Opportunities</h3>
                    <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
                        {filteredData.filter(d => d.active_signal).length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                <Search size={32} className="mb-2 opacity-50" />
                                <span className="text-xs">No active signals</span>
                            </div>
                        ) : (
                            filteredData.filter(d => d.active_signal).map(item => (
                                <div key={item.symbol} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-700">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-bold text-slate-700 dark:text-slate-200">{item.symbol}</span>
                                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${item.active_signal === 'BUY'
                                                ? 'bg-emerald-100 text-emerald-600'
                                                : 'bg-red-100 text-red-600'
                                            }`}>
                                            {item.active_signal}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <span className="text-xs text-slate-500">Str: {item.signal_strength}%</span>
                                        <span className="text-sm font-mono font-medium">{fmtPrice(item.price)}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* 3. Detailed Data Table with Pagination */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">

                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
                    <h3 className="font-bold text-slate-700 dark:text-slate-200">Detailed Market Metrics</h3>
                    <span className="text-xs text-slate-500">
                        Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredData.length)} of {filteredData.length} assets
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 font-medium border-b border-slate-200 dark:border-slate-700">
                            <tr>
                                <th className="px-6 py-3">Asset</th>
                                <th className="px-6 py-3">Price</th>
                                <th className="px-6 py-3">RSI (14)</th>
                                <th className="px-6 py-3">MACD (12,26)</th>
                                <th className="px-6 py-3">EMA Trend</th>
                                <th className="px-6 py-3">Signal Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                            {currentData.length > 0 ? (
                                currentData.map((row, index) => {
                                    const macdVal = parseFloat(row.macd_line);
                                    const macdSig = parseFloat(row.macd_signal);
                                    const isBullishMacd = macdVal > macdSig;

                                    return (
                                        <tr key={`${row.symbol}-${index}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded text-slate-500">
                                                        {row.asset_type === 'ENERGY' && <Zap size={16} />}
                                                        {row.asset_type === 'AGRI' && <Droplets size={16} />}
                                                        {row.asset_type === 'METAL' && <Hammer size={16} />}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-800 dark:text-white">{row.symbol}</div>
                                                        <div className="text-xs text-slate-500">{row.name}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-mono font-medium text-slate-700 dark:text-slate-300">
                                                {fmtPrice(row.price)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`font-bold ${parseFloat(row.rsi_14) > 70 ? 'text-red-500' :
                                                        parseFloat(row.rsi_14) < 30 ? 'text-emerald-500' : 'text-slate-600'
                                                    }`}>
                                                    {fmtNum(row.rsi_14)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-xs px-2 py-0.5 rounded ${isBullishMacd ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                                                        }`}>
                                                        {isBullishMacd ? 'Bullish' : 'Bearish'}
                                                    </span>
                                                    <span className="text-xs text-slate-400">({fmtNum(row.macd_line)})</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-xs text-slate-500">
                                                <div className="flex flex-col">
                                                    <span>EMA50: {fmtNum(row.ema_50)}</span>
                                                    <span className="scale-90 origin-left text-slate-400">
                                                        vs Price: {parseFloat(row.price) > parseFloat(row.ema_50) ? 'Above' : 'Below'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {row.active_signal ? (
                                                    <div className="flex items-center gap-2">
                                                        {row.active_signal === 'BUY'
                                                            ? <ArrowUpRight size={16} className="text-emerald-500" />
                                                            : <ArrowDownRight size={16} className="text-red-500" />}
                                                        <span className="font-medium text-slate-700 dark:text-slate-300">
                                                            {row.active_signal}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400 text-xs">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                        No data found matching your filter.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
                    <button
                        onClick={handlePrevPage}
                        disabled={currentPage === 1}
                        className={`p-2 rounded-lg flex items-center gap-1 text-xs font-bold transition-colors ${currentPage === 1
                                ? 'text-slate-300 cursor-not-allowed'
                                : 'text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700'
                            }`}
                    >
                        <ChevronLeft size={16} /> Previous
                    </button>

                    <span className="text-xs text-slate-500 font-medium">
                        Page {currentPage} of {Math.max(totalPages, 1)}
                    </span>

                    <button
                        onClick={handleNextPage}
                        disabled={currentPage >= totalPages}
                        className={`p-2 rounded-lg flex items-center gap-1 text-xs font-bold transition-colors ${currentPage >= totalPages
                                ? 'text-slate-300 cursor-not-allowed'
                                : 'text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700'
                            }`}
                    >
                        Next <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AnalysisPage;