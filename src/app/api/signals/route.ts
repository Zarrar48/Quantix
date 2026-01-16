import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT 
        t.symbol, 
        t.signal_type, 
        t.strength, 
        t.trigger_price, 
        t.created_at,
        c.name as asset_name
      FROM trade_signals t
      LEFT JOIN commodities c ON t.symbol = c.symbol
      ORDER BY t.created_at DESC 
      LIMIT 1
    `);

    if (result.rows.length === 0) {
      return NextResponse.json(null);
    }

    const sig = result.rows[0];

    return NextResponse.json({
      symbol: sig.symbol,
      assetName: sig.asset_name || sig.symbol, 
      type: sig.signal_type,
      price: Number(sig.trigger_price),
      strength: sig.strength,
      timestamp: sig.created_at,
    });

  } catch (error) {
    console.error("Signal Widget API Error:", error);
    return NextResponse.json({ error: "Failed to fetch signal" }, { status: 500 });
  }
}