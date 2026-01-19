'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Clock, 
  RefreshCw, 
  AlertCircle, 
  DollarSign,
  Search,
  ArrowRight
} from 'lucide-react';

interface TradeSignal {
  id: number;
  symbol: string;        
  signal_type: string;    
  strength: number;      
  reason: string;        
  trigger_price: string;  
  created_at: string;   
}

const TradeSignalsPage = () => {
  const [signals, setSignals] = useState<TradeSignal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

const fetchSignals = async () => {
    try {
      const response = await fetch('/api/signals?all=true');
      if (!response.ok) throw new Error('Failed to fetch');
      
      const data = await response.json();
    
      if (Array.isArray(data)) {
        setSignals(data);
      } else {
        setSignals([]); 
      }
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching signals:", error);
      setSignals([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSignals();
    const interval = setInterval(fetchSignals, 5000); 
    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price: string) => {
    const num = parseFloat(price);
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 2 
    }).format(num);
  };

  const getSignalStyle = (type: string) => {
    const isBuy = type?.toUpperCase() === 'BUY' || type?.toUpperCase() === 'LONG';
    return isBuy 
      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
      : 'bg-red-500/10 text-red-500 border-red-500/20';
  };

  const filteredSignals = signals.filter(s => 
    s.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 bg-slate-50 dark:bg-slate-900 min-h-screen">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
            <Activity className="text-emerald-500" />
            Trade Signals
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time market opportunities detected by the engine.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
           <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
             <input 
               type="text" 
               placeholder="Search symbol..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="pl-9 pr-4 py-1.5 bg-slate-100 dark:bg-slate-900 rounded-lg text-sm focus:outline-none w-40 md:w-64 transition-all"
             />
           </div>
           <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>
           <span className="text-xs text-slate-400 px-2 min-w-[80px]" suppressHydrationWarning>
             Updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : "..."}
           </span>
           <button 
             onClick={() => { setIsLoading(true); fetchSignals(); }}
             className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-500"
             title="Force Refresh"
           >
             <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
           </button>
        </div>
      </div>

      {/* Signals Grid */}
      {isLoading && signals.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>
          ))}
        </div>
      ) : filteredSignals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Activity size={48} className="mb-4 opacity-20" />
          <p>No active signals found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredSignals.map((signal) => {
            const isBuy = signal.signal_type.toUpperCase() === 'BUY';
            
            return (
              <div 
                key={signal.id} 
                className="group bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg hover:border-emerald-500/30 transition-all duration-300 relative overflow-hidden"
              >
                {/* Top Row: Symbol & Badge */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                      {signal.symbol}
                      <span className="text-xs font-normal text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">
                        Crypto
                      </span>
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                      <Clock size={12} />
                      {new Date(signal.created_at).toLocaleString()}
                    </div>
                  </div>
                  
                  <span className={`px-3 py-1 rounded-lg text-xs font-bold tracking-wider border flex items-center gap-1 ${getSignalStyle(signal.signal_type)}`}>
                    {isBuy ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    {signal.signal_type.toUpperCase()}
                  </span>
                </div>

                {/* Middle Row: Price & Reason */}
                <div className="space-y-3 mb-5">
                   <div className="flex justify-between items-end">
                      <div className="text-sm text-slate-500">Trigger Price</div>
                      <div className="text-xl font-mono font-semibold text-slate-700 dark:text-slate-200">
                        {formatPrice(signal.trigger_price)}
                      </div>
                   </div>

                   <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700/50">
                     <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                       <span className="font-semibold text-purple-500 mr-1">Analysis:</span>
                       {signal.reason}
                     </p>
                   </div>
                </div>

                {/* Bottom Row: Strength Meter */}
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-500 font-medium">Signal Strength</span>
                    <span className={`font-bold ${signal.strength > 80 ? 'text-emerald-500' : 'text-amber-500'}`}>
                      {signal.strength}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ease-out ${
                        signal.strength > 80 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-amber-500 to-orange-400'
                      }`}
                      style={{ width: `${signal.strength}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TradeSignalsPage;