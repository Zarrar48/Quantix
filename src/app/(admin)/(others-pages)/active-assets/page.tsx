'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Zap, Droplets, Hammer, Search, TrendingUp, TrendingDown, 
  ArrowRight, Activity, Clock, DollarSign
} from 'lucide-react';

// Interfaces
interface ActiveAsset {
  symbol: string;
  name: string;
  asset_type: 'ENERGY' | 'METAL' | 'AGRI';
  current_price: string;
  last_signal: 'BUY' | 'SELL' | null;
  last_signal_time: string | null;
}

const ActiveAssetsPage = () => {
  const [assets, setAssets] = useState<ActiveAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  // Fetch Data
  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const res = await fetch('/api/commodities/active');
        if (res.ok) {
          const data = await res.json();
          setAssets(data);
        }
      } catch (error) {
        console.error("Failed to load active assets", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAssets();
  }, []);

  // Filter Logic
  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          asset.symbol.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'ALL' || asset.asset_type === filterType;
    return matchesSearch && matchesType;
  });

  // Helpers
  const formatCurrency = (val: string) => 
    val ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parseFloat(val)) : '---';

  const getIcon = (type: string) => {
    switch(type) {
      case 'ENERGY': return <Zap className="text-amber-500" />;
      case 'METAL': return <Hammer className="text-slate-500" />;
      case 'AGRI': return <Droplets className="text-emerald-500" />;
      default: return <Activity />;
    }
  };

  const getTimeAgo = (dateStr: string | null) => {
    if (!dateStr) return 'No signals yet';
    const diff = new Date().getTime() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="p-6 min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Active Assets</h1>
          <p className="text-slate-500 dark:text-slate-400">
            Monitor and manage currently trading commodities across all markets.
          </p>
        </div>
        
        {/* Search & Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search assets..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none w-full sm:w-64"
            />
          </div>
          
          <div className="flex bg-white dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
            {['ALL', 'ENERGY', 'METAL', 'AGRI'].map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                  filterType === t 
                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300' 
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => (
            <div key={i} className="h-48 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssets.map((asset) => (
            <div 
              key={asset.symbol} 
              className="group bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300 flex flex-col"
            >
              
              {/* Card Header */}
              <div className="p-5 flex justify-between items-start border-b border-slate-100 dark:border-slate-700/50">
                <div className="flex gap-4">
                  <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg h-fit group-hover:scale-110 transition-transform">
                    {getIcon(asset.asset_type)}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{asset.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-mono bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-500">
                        {asset.symbol}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded border border-emerald-100 dark:border-emerald-900">
                        ACTIVE
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Price & Signal Info */}
              <div className="p-5 flex-1 flex flex-col justify-center gap-4">
                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-xs text-slate-400 uppercase font-semibold flex items-center gap-1">
                      <DollarSign size={12}/> Current Price
                    </span>
                    <div className="text-2xl font-bold tracking-tight mt-1">
                      {formatCurrency(asset.current_price)}
                    </div>
                  </div>
                  
                  {asset.last_signal && (
                    <div className="text-right">
                       <span className="text-xs text-slate-400 uppercase font-semibold flex items-center justify-end gap-1">
                         Last Signal <Clock size={12}/>
                       </span>
                       <div className={`mt-1 flex items-center justify-end gap-1 font-bold ${
                         asset.last_signal === 'BUY' ? 'text-emerald-500' : 'text-red-500'
                       }`}>
                         {asset.last_signal === 'BUY' ? <TrendingUp size={16}/> : <TrendingDown size={16}/>}
                         {asset.last_signal}
                       </div>
                       <div className="text-[10px] text-slate-400 mt-0.5">
                         {getTimeAgo(asset.last_signal_time)}
                       </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Footer */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 rounded-b-xl flex gap-3">
                <Link 
                  href={`/analysis?symbol=${asset.symbol}`} 
                  className="flex-1 flex justify-center items-center gap-2 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                >
                  <Activity size={16} /> Analysis
                </Link>
                <div className="w-px bg-slate-200 dark:bg-slate-700 my-1"></div>
                <Link 
                  href={`/signals?search=${asset.symbol}`} 
                  className="flex-1 flex justify-center items-center gap-2 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                >
                  History <ArrowRight size={16} />
                </Link>
              </div>

            </div>
          ))}
        </div>
      )}

      {!loading && filteredAssets.length === 0 && (
        <div className="text-center py-20">
          <div className="bg-slate-100 dark:bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="text-slate-400" size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No active assets found</h3>
          <p className="text-slate-500">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
};

export default ActiveAssetsPage;