export interface Signal {
  id: number;
  symbol: string;
  type: "BUY" | "SELL" | "HOLD";
  strength: number;
  price: number;
  reason: string;
  time: string;
}

export interface TradingMetrics {
  activeAssets: number;
  lastUpdate: string;
  systemStatus: "Operational" | "Critical";
  dailySignalCount: number;
  latestSignal: {
    symbol: string;
    strength: number;
    type: "BUY" | "SELL" | "HOLD" | "WAIT";
  };
}

export interface CandleData {
  x: number;         
  y: [number, number, number, number]; 
}
export interface DashboardResponse {
  metrics: TradingMetrics;
  signals: Signal[];
  chartData: Record<string, CandleData[]>;
  assetNames: Record<string, string>;
}

export const fetchDashboardData = async (): Promise<DashboardResponse> => {
  const response = await fetch('/api/dashboard', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store' 
  });

  if (!response.ok) {
    throw new Error(`Error fetching dashboard data: ${response.statusText}`);
  }

  return await response.json();
};