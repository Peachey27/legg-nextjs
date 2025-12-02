import { NextRequest, NextResponse } from 'next/server';
import { db, daySettings } from '@/lib/db';
import { eq } from 'drizzle-orm';

const normalizeDayId = (value: string) => {
  try {
    const d = new Date(value);
    // Force to YYYY-MM-DD to avoid timezone drift
    return d.toISOString().slice(0, 10);
  } catch {
    return value;
  }
};

// GET /api/day-settings - Get all day settings
export async function GET() {
  try {
    const allSettings = await db.select().from(daySettings);
    return NextResponse.json(allSettings);
  } catch (error) {
    console.error('Error fetching day settings:', error);
    return NextResponse.json({ error: 'Failed to fetch day settings', details: `${error}` }, { status: 500 });
  }
}

// PUT /api/day-settings - Bulk upsert day settings
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const settings = body as {
      dayId: string;
      capacityOverride?: number | null;
      isFridayLocked?: boolean | null;
      dayNote?: string;
    }[];

    console.log('[day-settings] incoming', JSON.stringify(settings, null, 2));

    const results = [];

    for (const setting of settings) {
      const dayId = normalizeDayId(setting.dayId);

      console.log('[day-settings] upsert', {
        dayId,
        capacityOverride: setting.capacityOverride,
        isFridayLocked: setting.isFridayLocked,
        dayNote: setting.dayNote,
      });

      await db
        .insert(daySettings)
        .values({
          dayId,
          capacityOverride: setting.capacityOverride ?? null,
          isFridayLocked: setting.isFridayLocked ?? null,
          dayNote: setting.dayNote ?? '',
        })
        .onConflictDoUpdate({
          target: daySettings.dayId,
          set: {
            capacityOverride: setting.capacityOverride ?? null,
            isFridayLocked: setting.isFridayLocked ?? null,
            dayNote: setting.dayNote ?? '',
          },
        });

      const fresh = await db
        .select()
        .from(daySettings)
        .where(eq(daySettings.dayId, dayId));

      console.log('[day-settings] saved row', fresh);
      results.push(fresh[0] ?? null);
    }

    return NextResponse.json({ success: true, rows: results });
  } catch (error) {
    console.error('Error updating day settings:', error);
    return NextResponse.json(
      { error: 'Failed to update day settings', details: `${error}` },
      { status: 500 }
    );
  }
}

// OPTIONS /api/day-settings - CORS / preflight support
export function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Allow': 'GET,PUT,OPTIONS',
      },
    }
  );
}
