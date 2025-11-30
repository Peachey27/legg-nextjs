import { NextRequest, NextResponse } from 'next/server';
import { db, jobs } from '@/lib/db';
import { eq } from 'drizzle-orm';

interface JobUpdate {
  id: string;
  order: number;
  cutOrder: number;
  startDayId: string | null;
  cutStartDayId: string | null;
}

// POST /api/jobs/reorder - Bulk reorder jobs
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Support new format: { jobs: [...] }
    if (body.jobs) {
      const jobUpdates = body.jobs as JobUpdate[];

      for (const update of jobUpdates) {
        await db.update(jobs)
          .set({
            order: update.order,
            cutOrder: update.cutOrder,
            startDayId: update.startDayId,
            cutStartDayId: update.cutStartDayId,
            updatedAt: new Date(),
          })
          .where(eq(jobs.id, update.id));
      }

      return NextResponse.json({ success: true });
    }

    // Legacy format: { view, orders }
    const { view, orders } = body as {
      view: 'fab' | 'cut';
      orders: { id: string; order: number; dayId: string | null }[];
    };

    for (const { id, order, dayId } of orders) {
      if (view === 'fab') {
        await db.update(jobs)
          .set({
            order,
            startDayId: dayId,
            updatedAt: new Date(),
          })
          .where(eq(jobs.id, id));
      } else {
        await db.update(jobs)
          .set({
            cutOrder: order,
            cutStartDayId: dayId,
            updatedAt: new Date(),
          })
          .where(eq(jobs.id, id));
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reordering jobs:', error);
    return NextResponse.json({ error: 'Failed to reorder jobs' }, { status: 500 });
  }
}
