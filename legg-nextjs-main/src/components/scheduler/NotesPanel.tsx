'use client';

import { useMemo } from 'react';
import { clsx } from 'clsx';
import { useJobStore } from '@/stores/jobStore';
import { useUIStore } from '@/stores/uiStore';
import type { Day, ScheduleByDay } from '@/types';

interface NotesPanelProps {
  days: Day[];
  scheduleByDay: ScheduleByDay;
}

interface NoteEntry {
  jobId: string;
  dayIndex: number;
  order: number;
  dayLabel: string;
  note: string;
  title: string;
  vquote: string;
  color: string;
}

export function NotesPanel({ days, scheduleByDay }: NotesPanelProps) {
  const jobs = useJobStore((state) => state.jobs);
  const { openEditJob } = useUIStore();
  const isFullScreen = useUIStore((state) => state.isFullScreen);

  const noteEntries = useMemo(() => {
    const firstByJob: Record<string, Omit<NoteEntry, 'jobId'>> = {};

    days.forEach((day, idx) => {
      const segments = scheduleByDay[day.id] || [];
      segments.forEach((seg) => {
        const job = jobs.find((j) => j.id === seg.jobId);
        if (!job) return;
        const note = job.note?.trim();
        if (!note) return;

        const existing = firstByJob[job.id];
        if (!existing || idx < existing.dayIndex) {
          firstByJob[job.id] = {
            dayIndex: idx,
            order: job.order,
            dayLabel: day.label,
            note,
            title: job.title,
            vquote: job.vquote,
            color: job.color,
          };
        }
      });
    });

    return Object.entries(firstByJob)
      .map(([jobId, info]) => ({ jobId, ...info }))
      .sort((a, b) => {
        if (a.dayIndex !== b.dayIndex) return a.dayIndex - b.dayIndex;
        return a.order - b.order;
      });
  }, [days, scheduleByDay, jobs]);

  return (
    <aside
      className={clsx(
        'flex-shrink-0 flex flex-col',
        isFullScreen ? 'w-95' : 'w-75',
        'bg-notes-panel-gradient',
        'border-l border-white/5',
        'p-4'
      )}
    >
      <div className="text-sm font-semibold text-text mb-1">Notes in schedule</div>
      <div className="text-xs text-text-muted mb-4">
        Ordered from earliest day & position on the board.
      </div>

      <div className="flex-1 overflow-y-auto space-y-2">
        {noteEntries.length === 0 && (
          <div className="text-xs text-text-muted/50">No job notes in view.</div>
        )}

        {noteEntries.map((entry) => (
          <div
            key={entry.jobId}
            className={clsx(
              'rounded-lg p-2 cursor-pointer',
              'border-l-4 bg-bg-soft/50',
              'hover:bg-bg-softer/70 transition-colors'
            )}
            style={{ borderLeftColor: entry.color }}
            onDoubleClick={() => openEditJob(entry.jobId)}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-xs text-text">
                {entry.title.toUpperCase()}
              </span>
              <span className="text-[10px] text-text-muted">VQ {entry.vquote}</span>
            </div>
            <div className="text-[10px] text-accent mb-1">{entry.dayLabel}</div>
            <div
              className="text-sm font-bold leading-relaxed uppercase drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)]"
              style={{ color: '#ff3b6b' }}
            >
              {entry.note.toUpperCase()}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
