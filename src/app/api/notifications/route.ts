import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const signalsQuery = pool.query(`
      SELECT 'signal' as type, symbol, signal_type, strength, created_at 
      FROM trade_signals 
      ORDER BY created_at DESC LIMIT 5
    `);

    const logsQuery = pool.query(`
      SELECT 'alert' as type, level as symbol, message as signal_type, 0 as strength, created_at 
      FROM system_logs 
      WHERE level IN ('WARNING', 'ERROR')
      ORDER BY created_at DESC LIMIT 5
    `);

    const [signalsRes, logsRes] = await Promise.all([signalsQuery, logsQuery]);

    const combined = [...signalsRes.rows, ...logsRes.rows].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return NextResponse.json(combined.slice(0, 6));

  } catch (error) {
    console.error("Notification API Error:", error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}