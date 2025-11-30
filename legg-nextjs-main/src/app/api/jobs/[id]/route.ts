import { NextRequest, NextResponse } from 'next/server';
import { db, jobs } from '@/lib/db';
import { eq } from 'drizzle-orm';

// GET /api/jobs/[id] - Get a single job
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await db.select().from(jobs).where(eq(jobs.id, id));

    if (result.length === 0) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const job = result[0];
    return NextResponse.json({
      ...job,
      totalHours: parseFloat(job.totalHours),
      cutHours: parseFloat(job.cutHours),
    });
  } catch (error) {
    console.error('Error fetching job:', error);
    return NextResponse.json({ error: 'Failed to fetch job' }, { status: 500 });
  }
}

// PUT /api/jobs/[id] - Update a job
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updates: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (body.title !== undefined) updates.title = body.title;
    if (body.vquote !== undefined) updates.vquote = body.vquote;
    if (body.totalHours !== undefined) updates.totalHours = body.totalHours.toString();
    if (body.cutHours !== undefined) updates.cutHours = body.cutHours.toString();
    if (body.type !== undefined) updates.type = body.type;
    if (body.color !== undefined) updates.color = body.color;
    if (body.note !== undefined) updates.note = body.note;
    if (body.startDayId !== undefined) updates.startDayId = body.startDayId;
    if (body.order !== undefined) updates.order = body.order;
    if (body.cutStartDayId !== undefined) updates.cutStartDayId = body.cutStartDayId;
    if (body.cutOrder !== undefined) updates.cutOrder = body.cutOrder;

    const result = await db.update(jobs)
      .set(updates)
      .where(eq(jobs.id, id))
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const job = result[0];
    return NextResponse.json({
      ...job,
      totalHours: parseFloat(job.totalHours),
      cutHours: parseFloat(job.cutHours),
    });
  } catch (error) {
    console.error('Error updating job:', error);
    return NextResponse.json({ error: 'Failed to update job' }, { status: 500 });
  }
}

// DELETE /api/jobs/[id] - Delete a job
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.delete(jobs).where(eq(jobs.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting job:', error);
    return NextResponse.json({ error: 'Failed to delete job' }, { status: 500 });
  }
}
