'use client'; 
import React, { useState } from 'react';
import { Save, Zap, Target, Sliders, CheckCircle, Loader2, AlertTriangle, Info } from 'lucide-react';

type SectorKey = 'energy' | 'metals' | 'agri';

interface ConfigState {
  minConfidence: number;
  riskProfile: string;
  timeframes: string[];
  sectors: Record<SectorKey, boolean>;
}

const StrategiesPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const [config, setConfig] = useState<ConfigState>({
    minConfidence: 75,
    riskProfile: 'Balanced',
    timeframes: ['1H', '4H', '1D'],
    sectors: {
      energy: true,
      metals: true,
      agri: false,
    }
  });

  const sectorOptions: { id: SectorKey; label: string; color: string }[] = [
    { id: 'energy', label: 'Energy (Oil, Gas)', color: 'bg-amber-500' },
    { id: 'metals', label: 'Metals (Gold, Silver)', color: 'bg-yellow-500' },
    { id: 'agri', label: 'Agriculture (Corn, Wheat)', color: 'bg-green-500' }
  ];

  const handleSectorToggle = (sector: SectorKey) => {
    setConfig(prev => ({
      ...prev,
      sectors: { ...prev.sectors, [sector]: !prev.sectors[sector] }
    }));
  };

  const handleTimeframeToggle = (tf: string) => {
    setConfig(prev => {
      const exists = prev.timeframes.includes(tf);
      return {
        ...prev,
        timeframes: exists 
          ? prev.timeframes.filter(t => t !== tf) 
          : [...prev.timeframes, tf]
      };
    });
  };

  const handleSave = async () => {
    setIsLoading(true);
    setSuccessMsg('');

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Configuration Saved:', config);
      
      setSuccessMsg('Configuration updated successfully!');
      
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error) {
      console.error('Failed to save', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 bg-slate-50 dark:bg-slate-900 min-h-screen text-slate-800 dark:text-slate-200">
     {/* Simulation / Preview Mode Banner */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 mb-8 rounded-r-lg flex items-start gap-3 shadow-sm">
        <Info className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" size={20} />
        <div>
          <h3 className="font-bold text-blue-900 dark:text-blue-200 text-sm">
            Configuration Preview
          </h3>
          <p className="text-blue-800 dark:text-blue-300/80 text-sm mt-1 leading-relaxed">
            These settings are currently for <strong>demonstration purposes only</strong>. 
            Adjusting these values will <span className="underline decoration-blue-500/50">not</span> affect the live trading bot at this time. 
            Full integration with the trading engine is scheduled for a future update.
          </p>
        </div>
      </div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">Strategy Configuration</h1>
          <p className="text-sm text-slate-500">Configure parameters for the analysis engine.</p>
        </div>
        
        <div className="flex items-center gap-4">
           {successMsg && (
            <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 rounded-lg text-sm animate-in fade-in slide-in-from-bottom-2">
              <CheckCircle size={16} />
              <span>{successMsg}</span>
            </div>
           )}

          <button 
            onClick={handleSave}
            disabled={isLoading}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-70 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
          >
            {isLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            <span>{isLoading ? 'Saving...' : 'Update Configuration'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Sliders className="text-blue-500" size={24} />
            </div>
            <h2 className="text-lg font-semibold">Signal Logic</h2>
          </div>

          <div className="space-y-8">
            <div>
              <div className="flex justify-between mb-2">
                <label className="font-medium text-slate-600 dark:text-slate-300">Minimum Confidence Threshold</label>
                <span className="text-emerald-500 font-bold">{config.minConfidence}%</span>
              </div>
              <input 
                type="range" 
                min="50" 
                max="95" 
                value={config.minConfidence}
                onChange={(e) => setConfig({...config, minConfidence: parseInt(e.target.value)})}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <p className="text-xs text-slate-500 mt-2">
                The system will ignore patterns with a statistical probability lower than this value.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {['Conservative', 'Balanced', 'Aggressive'].map((profile) => (
                <button
                  key={profile}
                  onClick={() => setConfig({...config, riskProfile: profile})}
                  className={`py-3 px-4 rounded-lg border text-sm font-medium transition-all ${
                    config.riskProfile === profile
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500'
                      : 'border-slate-200 dark:border-slate-700 hover:border-emerald-500/50'
                  }`}
                >
                  {profile}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
           <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Target className="text-purple-500" size={24} />
            </div>
            <h2 className="text-lg font-semibold">Active Sectors</h2>
          </div>

          <div className="space-y-4">
            {sectorOptions.map((sector) => (
              <div key={sector.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${sector.color}`}></div>
                  <span className="text-sm font-medium">{sector.label}</span>
                </div>
                <button 
                  onClick={() => handleSectorToggle(sector.id)}
                  className={`w-10 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${config.sectors[sector.id] ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-200 ${config.sectors[sector.id] ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
           <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <Zap className="text-orange-500" size={24} />
            </div>
            <h2 className="text-lg font-semibold">Analysis Timeframes</h2>
          </div>
          
          <div className="flex flex-wrap gap-3">
             {['15m', '30m', '1H', '4H', '1D', '1W'].map((tf) => (
               <label key={tf} className="cursor-pointer">
                 <input 
                    type="checkbox" 
                    className="peer sr-only" 
                    checked={config.timeframes.includes(tf)}
                    onChange={() => handleTimeframeToggle(tf)}
                 />
                 <div className="px-5 py-2 rounded-full border border-slate-200 dark:border-slate-700 text-slate-500 peer-checked:bg-slate-800 peer-checked:text-white dark:peer-checked:bg-white dark:peer-checked:text-slate-900 transition-all select-none">
                   {tf}
                 </div>
               </label>
             ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default StrategiesPage;