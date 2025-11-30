import { NextResponse } from 'next/server';
import { db, jobs, daySettings, appSettings } from '@/lib/db';
import { eq } from 'drizzle-orm';

// GET /api/state/export - Export full state as JSON
export async function GET() {
  try {
    const allJobs = await db.select().from(jobs);
    const allDaySettings = await db.select().from(daySettings);
    const settingsResult = await db.select().from(appSettings).where(eq(appSettings.key, 'app_settings'));

    // Format jobs
    const formattedJobs = allJobs.map(job => ({
      id: job.id,
      title: job.title,
      vquote: job.vquote,
      totalHours: parseFloat(job.totalHours),
      cutHours: parseFloat(job.cutHours),
      type: job.type,
      color: job.color,
      note: job.note,
      startDayId: job.startDayId,
      order: job.order,
      cutStartDayId: job.cutStartDayId,
      cutOrder: job.cutOrder,
    }));

    // Convert day settings to records
    const dayCapacityOverrides: Record<string, number> = {};
    const fridayLocks: Record<string, boolean> = {};
    const dayNotes: Record<string, string> = {};

    for (const ds of allDaySettings) {
      if (ds.capacityOverride !== null) {
        dayCapacityOverrides[ds.dayId] = ds.capacityOverride;
      }
      if (ds.isFridayLocked !== null) {
        fridayLocks[ds.dayId] = ds.isFridayLocked;
      }
      if (ds.dayNote) {
        dayNotes[ds.dayId] = ds.dayNote;
      }
    }

    const state = {
      jobs: formattedJobs,
      dayCapacityOverrides,
      fridayLocks,
      dayNotes,
      settings: settingsResult[0]?.value || null,
      exportedAt: new Date().toISOString(),
    };

    return NextResponse.json(state);
  } catch (error) {
    console.error('Error exporting state:', error);
    return NextResponse.json({ error: 'Failed to export state' }, { status: 500 });
  }
}
