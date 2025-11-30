import { NextRequest, NextResponse } from 'next/server';
import { db, appSettings } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { DEFAULT_SETTINGS } from '@/types';

const SETTINGS_KEY = 'app_settings';

// GET /api/settings - Get app settings
export async function GET() {
  try {
    const result = await db.select().from(appSettings).where(eq(appSettings.key, SETTINGS_KEY));

    if (result.length === 0) {
      return NextResponse.json(DEFAULT_SETTINGS);
    }

    return NextResponse.json(result[0].value);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

// PUT /api/settings - Update app settings
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    await db
      .insert(appSettings)
      .values({
        key: SETTINGS_KEY,
        value: body,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: appSettings.key,
        set: {
          value: body,
          updatedAt: new Date(),
        },
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
