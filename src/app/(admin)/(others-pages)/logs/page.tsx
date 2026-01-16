'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Filter, Pause, Play, Trash2, Search, RefreshCw, Loader2, AlertTriangle } from 'lucide-react';

interface LogEntry {
  id: number;
  level: string; 
  component: string;
  message: string; 
  created_at: string; 
}

const SystemLogsPage = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'ERROR' | 'WARN' | 'INFO'>('ALL');
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchLogs = async () => {
    try {
      const response = await fetch('/api/logs');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setLogs(data);
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();

    const interval = setInterval(() => {
      if (!isPaused) {
        fetchLogs();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isPaused]);

  useEffect(() => {
    if (!isPaused && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, isPaused]);

  const filteredLogs = logs.filter(log => {
    const logLevel = log.level ? log.level.toUpperCase() : 'INFO';
    const matchesType = filter === 'ALL' || logLevel === filter;
    
    const matchesSearch = 
      (log.message?.toLowerCase().includes(searchQuery.toLowerCase()) || false) || 
      (log.component?.toLowerCase().includes(searchQuery.toLowerCase()) || false);
      
    return matchesType && matchesSearch;
  });

  const getLevelStyles = (level: string) => {
    const normalizedLevel = level ? level.toUpperCase() : 'INFO';
    switch (normalizedLevel) {
      case 'SUCCESS': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'ERROR': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'WARN': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      default: return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
    }
  };

  return (
    <div className="p-6 bg-slate-50 dark:bg-slate-900 min-h-screen flex flex-col h-[calc(100vh-2rem)]">
               {/* Disclaimer / Warning Banner */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 dark:border-amber-500 p-4 rounded-r-lg mb-6 flex items-start gap-3 shadow-sm">
        <AlertTriangle className="text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" size={20} />
        <div>
          <h3 className="font-bold text-amber-800 dark:text-amber-200 text-sm">
             Display Mode Only
          </h3>
          <p className="text-amber-700 dark:text-amber-300/80 text-sm mt-1 leading-relaxed">
            This dashboard is a passive viewer. <strong>Pausing</strong> or <strong>Filtering</strong> the logs here 
            does <span className="underline decoration-amber-500/50">not</span> stop the actual trading bot. 
            The bot continues to run, analyze data, and execute trades in the background on the server.
          </p>
        </div>
      </div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 flex-shrink-0">
        
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-200 dark:bg-slate-800 rounded-lg">
            <Terminal className="text-slate-600 dark:text-slate-300" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">System Logs</h1>
            <p className="text-sm text-slate-500">Live feed from PostgreSQL Database</p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
           <div className="relative group">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search logs..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 w-48 transition-all"
            />
          </div>

          <div className="h-6 w-px bg-slate-300 dark:bg-slate-700 mx-1 hidden md:block"></div>

          <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-lg">
            {['ALL', 'INFO', 'WARN', 'ERROR'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                  filter === f 
                  ? 'bg-white dark:bg-slate-700 shadow-sm text-emerald-600 dark:text-emerald-400' 
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="h-6 w-px bg-slate-300 dark:bg-slate-700 mx-1 hidden md:block"></div>

          <button 
            onClick={() => setIsPaused(!isPaused)}
            className={`p-2 rounded-lg border transition-colors ${isPaused ? 'bg-amber-100 border-amber-300 text-amber-600' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'}`}
            title={isPaused ? "Resume Feed" : "Pause Feed"}
          >
            {isPaused ? <Play size={18} /> : <Pause size={18} />}
          </button>
          
          <button 
            onClick={fetchLogs}
            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 rounded-lg transition-colors"
            title="Force Refresh"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* Terminal Window */}
      <div className="flex-1 bg-black rounded-xl border border-slate-800 shadow-2xl flex flex-col overflow-hidden">
        
        {/* Terminal Top Bar */}
        <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <span className="ml-3 text-xs font-mono text-slate-500">postgres@production:~/system_logs</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <div className={`w-2 h-2 rounded-full ${isPaused ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'}`}></div>
            {isPaused ? 'PAUSED' : 'LIVE CONNECTION'}
          </div>
        </div>

        {/* Scrollable Logs Area */}
        <div 
          ref={scrollRef}
          className="flex-1 p-4 overflow-y-auto font-mono text-xs sm:text-sm space-y-1 scroll-smooth"
        >
          {isLoading ? (
             <div className="h-full flex items-center justify-center text-slate-500 gap-2">
                <Loader2 className="animate-spin" /> Loading DB data...
             </div>
          ) : filteredLogs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-600">
              <Terminal size={48} className="mb-4 opacity-20" />
              <p>No logs found matching your criteria.</p>
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.id} className="group flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 p-1 hover:bg-slate-900/80 rounded transition-colors border-l-2 border-transparent hover:border-slate-700">
                
                {/* Timestamp */}
                <span className="text-slate-500 shrink-0 w-44 select-none">
                  [{new Date(log.created_at).toLocaleTimeString()}]
                </span>

                {/* Level Badge */}
                <span className={`shrink-0 w-20 text-center font-bold text-[10px] px-1 py-0.5 rounded border ${getLevelStyles(log.level)}`}>
                  {log.level || 'INFO'}
                </span>

                {/* Component */}
                <span className="text-purple-400 font-semibold shrink-0 w-32 hidden sm:block">
                  {log.component}
                </span>

                {/* Message */}
                <span className={`break-all ${log.level === 'ERROR' ? 'text-red-300' : 'text-slate-300'}`}>
                  {log.message}
                </span>
              </div>
            ))
          )}
          
          {/* Active Cursor Indicator */}
          {!isPaused && (
             <div className="flex items-center gap-2 mt-2 pl-1 animate-pulse opacity-50">
               <span className="text-emerald-500">➜</span>
               <div className="h-4 w-2 bg-slate-500"></div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SystemLogsPage;