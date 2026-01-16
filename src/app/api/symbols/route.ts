import { NextResponse } from 'next/server';
import  pool  from '@/lib/db'; 

export async function GET() {
  try {
    const query = `
      SELECT symbol, name 
      FROM commodities 
      WHERE is_active = true 
      ORDER BY symbol ASC
    `;
    const result = await pool.query(query);
    
    const symbols = ['ALL', ...result.rows.map((r: any) => r.symbol)];
    
    return NextResponse.json(symbols);
  } catch (error) {
    console.error('Error fetching symbols:', error);
    return NextResponse.json(['ALL'], { status: 500 });
  }
}