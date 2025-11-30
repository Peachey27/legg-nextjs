import { NextRequest, NextResponse } from 'next/server';
import { db, daySettings } from '@/lib/db';

// GET /api/day-settings - Get all day settings
export async function GET() {
  try {
    const allSettings = await db.select().from(daySettings);
    return NextResponse.json(allSettings);
  } catch (error) {
    console.error('Error fetching day settings:', error);
    return NextResponse.json({ error: 'Failed to fetch day settings' }, { status: 500 });
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

    for (const setting of settings) {
      await db
        .insert(daySettings)
        .values({
          dayId: setting.dayId,
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
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating day settings:', error);
    return NextResponse.json({ error: 'Failed to update day settings' }, { status: 500 });
  }
}
