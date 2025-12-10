'use client';

import { useState, useMemo } from 'react';
import { useJobStore } from '@/stores/jobStore';
import type { Day, ScheduleByDay } from '@/types';

interface MobileFinderProps {
  days: Day[];
  scheduleByDay: ScheduleByDay;
  onSelectDay: (dayId: string) => void;
}

export function MobileFinder({ days, scheduleByDay, onSelectDay }: MobileFinderProps) {
  const jobs = useJobStore((state) => state.jobs);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const dayLabelMap = useMemo(() => {
    const m: Record<string, string> = {};
    days.forEach((d) => {
      m[d.id] = d.label;
    });
    return m;
  }, [days]);

  const scheduledByJob = useMemo(() => {
    const lookup: Record<
      string,
      { jobId: string; dayId: string; dayLabel: string; color: string; title: string; vquote: string }
    > = {};

    days.forEach((day) => {
      const segments = scheduleByDay[day.id] || [];
      segments.forEach((seg) => {
        if (lookup[seg.jobId]) return;
        const job = jobs.find((j) => j.id === seg.jobId);
        if (!job) return;
        lookup[seg.jobId] = {
          jobId: job.id,
          dayId: day.id,
          dayLabel: dayLabelMap[day.id],
          color: job.color,
          title: job.title,
          vquote: job.vquote,
        };
      });
    });

    return lookup;
  }, [days, scheduleByDay, jobs, dayLabelMap]);

  const finderResults = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return [];
    return Object.values(scheduledByJob).filter(({ title, vquote }) => {
      return title.toLowerCase().includes(term) || vquote.toLowerCase().includes(term);
    });
  }, [query, scheduledByJob]);

  return (
    <div className="sm:hidden fixed right-3 top-24 z-40 w-[46%] max-w-xs">
      {!open ? (
        <button
          className="w-full rounded-full bg-accent text-bg px-3 py-2 text-xs font-semibold shadow-lg"
          onClick={() => setOpen(true)}
        >
          Find Job / VQ
        </button>
      ) : (
        <div className="bg-bg-softer/95 border border-white/10 rounded-xl p-3 space-y-2 shadow-xl">
          <div className="flex gap-2">
            <input
              className="flex-1 rounded-lg border border-border bg-bg px-2 py-1 text-xs text-text focus:outline-none focus:border-accent"
              placeholder="Search title or VQuote"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
            <button
              className="rounded-lg bg-accent/80 text-bg px-2 py-1 text-[11px] font-semibold"
              onClick={() => {
                setOpen(false);
                setQuery('');
              }}
            >
              Close
            </button>
          </div>

          <div className="max-h-52 overflow-y-auto space-y-1">
            {query.trim().length === 0 && (
              <div className="text-[11px] text-text-muted">Type to find a job...</div>
            )}
            {query.trim().length > 0 && finderResults.length === 0 && (
              <div className="text-[11px] text-text-muted">No matches in the active view.</div>
            )}
            {finderResults.map((entry) => (
              <div
                key={entry.jobId}
                className="rounded-lg border border-white/10 bg-bg px-2 py-1 text-[11px] text-text cursor-pointer"
                style={{ borderLeft: `6px solid ${entry.color}` }}
                onClick={() => {
                  onSelectDay(entry.dayId);
                  setOpen(false);
                  setQuery('');
                }}
              >
                <div className="font-semibold">{entry.title.toUpperCase()}</div>
                <div className="text-text-muted">VQ {entry.vquote}</div>
                <div className="text-accent">{entry.dayLabel}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
