import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const [signalsResult, candlesResult, logsResult, countResult, commoditiesResult] = await Promise.all([
      pool.query(`
        SELECT id, symbol, signal_type, strength, reason, trigger_price, created_at 
        FROM trade_signals 
        ORDER BY created_at DESC 
        LIMIT 10
      `),

      pool.query(`
        SELECT symbol, open, high, low, close, timestamp 
        FROM market_candles 
        WHERE timestamp > NOW() - INTERVAL '24 hours'
        ORDER BY timestamp ASC
      `),

      pool.query(`SELECT level, created_at FROM system_logs ORDER BY created_at DESC LIMIT 1`),

      pool.query(`
        SELECT COUNT(*) as count 
        FROM trade_signals 
        WHERE created_at > NOW() - INTERVAL '24 hours'
      `),

      pool.query(`SELECT symbol, name FROM commodities`)
    ]);

    const recentSignals = signalsResult.rows;
    const rawCandles = candlesResult.rows;
    const lastLog = logsResult.rows[0];
    const dailyCount = parseInt(countResult.rows[0].count, 10) || 0;
    const assetList = commoditiesResult.rows;
    const chartDataBySymbol: Record<string, any[]> = {};
    
    const assetNameMap: Record<string, string> = {};
    assetList.forEach((asset) => {
      assetNameMap[asset.symbol] = asset.name;
    });

    rawCandles.forEach((c) => {
      if (!chartDataBySymbol[c.symbol]) {
        chartDataBySymbol[c.symbol] = [];
      }
      chartDataBySymbol[c.symbol].push({
        x: new Date(c.timestamp).getTime(), 
        y: [
            Number(c.open), 
            Number(c.high), 
            Number(c.low), 
            Number(c.close)
        ]
      });
    });

    const latestSig = recentSignals[0];

    return NextResponse.json({
      metrics: {
        activeAssets: Object.keys(chartDataBySymbol).length, 
        lastUpdate: lastLog?.created_at || new Date(),
        systemStatus: lastLog?.level === 'ERROR' ? 'Critical' : 'Operational',
        dailySignalCount: dailyCount,
        latestSignal: {
          symbol: latestSig?.symbol || "N/A",
          name: assetNameMap[latestSig?.symbol] || latestSig?.symbol || "N/A",
          strength: latestSig?.strength || 0,
          type: latestSig?.signal_type || "WAIT"
        }
      },
      signals: recentSignals.map((sig) => ({
        id: sig.id,
        symbol: sig.symbol,
        type: sig.signal_type,
        strength: sig.strength,
        price: Number(sig.trigger_price),
        reason: sig.reason,
        time: sig.created_at,
      })),
      
      chartData: chartDataBySymbol ,
      assetNames: assetNameMap
    });

  } catch (error) {
    console.error("Dashboard DB Error:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}