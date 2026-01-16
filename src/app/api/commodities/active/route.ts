import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const client = await pool.connect();
    
    const query = `
      WITH LatestPrice AS (
        SELECT DISTINCT ON (symbol) symbol, close, timestamp
        FROM market_candles
        ORDER BY symbol, timestamp DESC
      ),
      LatestSignal AS (
        SELECT DISTINCT ON (symbol) symbol, signal_type, created_at
        FROM trade_signals
        ORDER BY symbol, created_at DESC
      )
      SELECT 
      c.symbol, 
      c.name,
      c.asset_type,
      c.is_active,
  lp.close as current_price,
  ls.signal_type as last_signal,
  ls.created_at as last_signal_time
FROM commodities c
      LEFT JOIN LatestPrice lp ON c.symbol = lp.symbol
      LEFT JOIN LatestSignal ls ON c.symbol = ls.symbol
      WHERE c.is_active = true
      ORDER BY c.asset_type, c.symbol;
    `;

    const result = await client.query(query);
    client.release();

    return NextResponse.json(result.rows);
  } catch (error: any) {
    console.error('Active Assets Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}