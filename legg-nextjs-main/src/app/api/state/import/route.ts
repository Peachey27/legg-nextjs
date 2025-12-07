import { NextRequest, NextResponse } from 'next/server';
import { db, jobs, daySettings, appSettings } from '@/lib/db';

// POST /api/state/import - Import state from JSON
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      jobs: importedJobs,
      dayCapacityOverrides,
      fridayLocks,
      dayNotes,
      settings,
    } = body;

    // Clear existing data
    await db.delete(jobs);
    await db.delete(daySettings);

    // Import jobs
    if (importedJobs && importedJobs.length > 0) {
      for (const job of importedJobs) {
        await db.insert(jobs).values({
          id: job.id || undefined,
          title: job.title,
          vquote: job.vquote || '',
          totalHours: job.totalHours?.toString() || '0',
          cutHours: job.cutHours?.toString() || '0',
          type: job.type || 'windows',
          color: job.color || '#ff6fae',
          note: job.note || '',
          startDayId: job.startDayId || null,
          order: job.order || 0,
          cutStartDayId: job.cutStartDayId || null,
          cutOrder: job.cutOrder || 0,
        });
      }
    }

    // Import day settings
    const allDayIds = new Set([
      ...Object.keys(dayCapacityOverrides || {}),
      ...Object.keys(fridayLocks || {}),
      ...Object.keys(dayNotes || {}),
    ]);

    for (const dayId of Array.from(allDayIds)) {
      const rawOverride = dayCapacityOverrides?.[dayId];
      const fabOverride =
        typeof rawOverride === 'number' ? rawOverride : rawOverride?.fab ?? null;
      const cutOverride =
        typeof rawOverride === 'number' ? null : rawOverride?.cut ?? null;

      await db.insert(daySettings).values({
        dayId,
        capacityOverride: fabOverride ?? null,
        cutCapacityOverride: cutOverride ?? null,
        isFridayLocked: fridayLocks?.[dayId] ?? null,
        dayNote: dayNotes?.[dayId] ?? '',
      });
    }

    // Import app settings
    if (settings) {
      await db
        .insert(appSettings)
        .values({
          key: 'app_settings',
          value: settings,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: appSettings.key,
          set: {
            value: settings,
            updatedAt: new Date(),
          },
        });
    }

    return NextResponse.json({
      success: true,
      imported: {
        jobs: importedJobs?.length || 0,
        daySettings: allDayIds.size,
      },
    });
  } catch (error) {
    console.error('Error importing state:', error);
    return NextResponse.json({ error: 'Failed to import state' }, { status: 500 });
  }
}
