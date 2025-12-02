import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

export async function GET() {
  try {
    const dbNameResult = await db.execute(sql`select current_database() as db`);
    const schemaResult = await db.execute(sql`select current_schema() as schema`);
    const addrResult = await db.execute(sql`select inet_server_addr() as addr`);

    const dbNameRow = Array.isArray((dbNameResult as any)?.rows) ? (dbNameResult as any).rows[0] : undefined;
    const schemaRow = Array.isArray((schemaResult as any)?.rows) ? (schemaResult as any).rows[0] : undefined;
    const addrRow = Array.isArray((addrResult as any)?.rows) ? (addrResult as any).rows[0] : undefined;

    return NextResponse.json({
      database: dbNameRow?.db ?? null,
      schema: schemaRow?.schema ?? null,
      serverAddress: addrRow?.addr ?? null,
    });
  } catch (error) {
    console.error('Error fetching DB info:', error);
    return NextResponse.json({ error: 'Failed to fetch DB info', details: `${error}` }, { status: 500 });
  }
}
