import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const client = await pool.connect();
    
    const result = await client.query(`
      SELECT id, level, component, message, created_at 
      FROM system_logs 
      ORDER BY created_at ASC 
      LIMIT 100
    `);
    
    client.release();

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch logs' },
      { status: 500 }
    );
  }
}