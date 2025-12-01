import { NextRequest, NextResponse } from 'next/server';
import { db, jobs } from '@/lib/db';
import { asc } from 'drizzle-orm';

// GET /api/jobs - List all jobs
export async function GET() {
  try {
    const allJobs = await db.select().from(jobs).orderBy(asc(jobs.order));

    // Convert decimal strings to numbers
    const formattedJobs = allJobs.map(job => ({
      ...job,
      totalHours: parseFloat(job.totalHours),
      extraHours: parseFloat(job.extraHours),
      cutHours: parseFloat(job.cutHours),
      extraCutHours: parseFloat(job.extraCutHours),
    }));

    return NextResponse.json(formattedJobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}

// POST /api/jobs - Create a new job
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const newJob = await db.insert(jobs).values({
      title: body.title,
      vquote: body.vquote || '',
      totalHours: body.totalHours?.toString() || '0',
      extraHours: body.extraHours?.toString() || '0',
      cutHours: body.cutHours?.toString() || '0',
      extraCutHours: body.extraCutHours?.toString() || '0',
      type: body.type || 'windows',
      color: body.color || '#ff6fae',
      note: body.note || '',
      startDayId: body.startDayId || null,
      order: body.order || 0,
      cutStartDayId: body.cutStartDayId || null,
      cutOrder: body.cutOrder || 0,
    }).returning();

    const job = newJob[0];
    return NextResponse.json({
      ...job,
      totalHours: parseFloat(job.totalHours),
      extraHours: parseFloat(job.extraHours),
      cutHours: parseFloat(job.cutHours),
      extraCutHours: parseFloat(job.extraCutHours),
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating job:', error);
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
  }
}
