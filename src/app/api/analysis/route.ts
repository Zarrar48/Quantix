import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const client = await pool.connect();

    const query = `
      WITH LatestCandle AS (
          SELECT DISTINCT ON (symbol) id, symbol, close, high, low, timestamp
          FROM market_candles
          ORDER BY symbol, timestamp DESC
      ),
      LatestIndicators AS (
          -- This CTE prevents duplicate indicators for the same candle
          SELECT DISTINCT ON (candle_id) *
          FROM technical_indicators
          ORDER BY candle_id, id DESC
      ),
      LatestSignal AS (
          SELECT DISTINCT ON (symbol) symbol, signal_type, strength, reason, created_at
          FROM trade_signals
          ORDER BY symbol, created_at DESC
      )
      SELECT 
          c.symbol, 
          c.name, 
          c.asset_type,
          lc.close as price,
          lc.high,
          lc.low,
          lc.timestamp as last_updated,
          ti.rsi_14,
          ti.macd_line,
          ti.macd_signal,
          ti.ema_50,
          ti.ema_200,
          ls.signal_type as active_signal,
          ls.strength as signal_strength,
          ls.reason as signal_reason,
          ls.created_at as signal_time
      FROM commodities c
      LEFT JOIN LatestCandle lc ON c.symbol = lc.symbol
      LEFT JOIN LatestIndicators ti ON lc.id = ti.candle_id
      LEFT JOIN LatestSignal ls ON c.symbol = ls.symbol
      ORDER BY c.asset_type, c.symbol;
    `;

    const result = await client.query(query);
    client.release();

    return NextResponse.json(result.rows);
  } catch (error: any) {
    console.error('Database Error Details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analysis data', details: error.message },
      { status: 500 }
    );
  }
}