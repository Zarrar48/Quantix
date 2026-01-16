import { fetchDashboardData, Signal, TradingMetrics } from "@/services/dashboardService";
import { useState, useEffect, useCallback } from "react";


export const useDashboard = () => {
  const [loading, setLoading] = useState(true);
  
  const [metrics, setMetrics] = useState<TradingMetrics | null>(null);
  const [signals, setSignals] = useState<Signal[]>([]);     
  const [chartData, setChartData] = useState<Record<string, any[]>>({}); 
  const [assetNames, setAssetNames] = useState<Record<string, string>>({})

  const loadData = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      
      const data = await fetchDashboardData();
      setMetrics(data.metrics);
      setSignals(data.signals);       
      setChartData(data.chartData); 
      setAssetNames(data.assetNames);

    } catch (error) {
      console.error("Failed to fetch trading data", error);
    } finally {
      if (isInitial) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(true);

    const intervalId = setInterval(() => {
      loadData(false); 
    }, 5000);

    return () => clearInterval(intervalId); 
  }, [loadData]);
  return { loading, metrics, signals, chartData, assetNames };
};