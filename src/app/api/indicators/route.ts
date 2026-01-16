import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const symbol = searchParams.get('symbol') || '';

    const offset = (page - 1) * limit;
    const client = await pool.connect();

    let whereClause = '';
    let values: any[] = [];
    
    if (symbol && symbol !== 'ALL') {
      whereClause = 'WHERE m.symbol = $1';
      values = [symbol];
    }

    const countQuery = `
      SELECT COUNT(*) 
      FROM technical_indicators t
      JOIN market_candles m ON t.candle_id = m.id
      ${whereClause}
    `;
    const countResult = await client.query(countQuery, values);
    const totalItems = parseInt(countResult.rows[0].count);

    const query = `
      SELECT 
        t.id,
        m.symbol,
        m.timestamp,
        m.volume,
        t.rsi_14,
        t.macd_line,
        t.macd_signal,
        t.ema_50,
        t.ema_200,
        t.bb_upper,
        t.bb_lower,
        t.atr
      FROM technical_indicators t
      JOIN market_candles m ON t.candle_id = m.id
      ${whereClause}
      ORDER BY m.timestamp DESC, m.symbol ASC
      LIMIT $${values.length + 1} OFFSET $${values.length + 2}
    `;

    const result = await client.query(query, [...values, limit, offset]);
    client.release();

    return NextResponse.json({
      data: result.rows,
      pagination: {
        total: totalItems,
        page,
        limit,
        totalPages: Math.ceil(totalItems / limit)
      }
    });

  } catch (error: any) {
    console.error('Technical Indicators Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}