import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

export async function GET() {
  try {
    const [dbName] = await db.execute(sql`select current_database() as db`);
    const [schema] = await db.execute(sql`select current_schema() as schema`);
    const [addr] = await db.execute(sql`select inet_server_addr() as addr`);

    return NextResponse.json({
      database: (dbName as any)?.db ?? null,
      schema: (schema as any)?.schema ?? null,
      serverAddress: (addr as any)?.addr ?? null,
    });
  } catch (error) {
    console.error('Error fetching DB info:', error);
    return NextResponse.json({ error: 'Failed to fetch DB info', details: `${error}` }, { status: 500 });
  }
}
