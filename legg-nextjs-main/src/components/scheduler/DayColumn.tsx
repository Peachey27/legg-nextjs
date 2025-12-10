'use client';

import { clsx } from 'clsx';
import { useRef, useCallback, useEffect, useState } from 'react';
import { JobCard } from './JobCard';
import { useDragDrop } from '@/hooks/useDragDrop';
import { useUIStore } from '@/stores/uiStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useJobStore } from '@/stores/jobStore';
import { getDayCapacity, isFridayLocked } from '@/lib/utils/capacity';
import { startOfToday, isSameDayISO, getCurrentTimeLinePosition } from '@/lib/utils/dates';
import type { AppSettings, Day, JobSegment, ViewMode } from '@/types';

type CapacityParams = AppSettings & {
  dayCapacityOverrides: Record<string, Partial<Record<ViewMode, number>>>;
  fridayLocks: Record<string, boolean>;
};

interface DayColumnProps {
  day: Day;
  segments: JobSegment[];
  isFullScreen?: boolean;
  extraFractions?: Record<string, number>;
  params: CapacityParams;
}

export function DayColumn({ day, segments, isFullScreen, extraFractions, params }: DayColumnProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { handleDropToDay, handleDragOver } = useDragDrop();
  const { openCapEdit, activeView } = useUIStore();
  const settings = useSettingsStore();
  const jobs = useJobStore((state) => state.jobs);

  const capacity = getDayCapacity(day, params, activeView);
  const usedHours = segments.reduce((sum, seg) => sum + seg.hours, 0);
  const isLocked = day.isFriday && isFridayLocked(day, params.fridayLocks);

  const isToday = isSameDayISO(day.id, startOfToday());
  const timeLinePosition = isToday ? getCurrentTimeLinePosition() : null;

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dropY = e.clientY - rect.top;
      const jobIdsOnDay = segments.map((s) => s.jobId);
      handleDropToDay(e, day.id, jobIdsOnDay, dropY, rect.height);
    },
    [day.id, segments, handleDropToDay]
  );

  const handleFridayLockToggle = () => {
    settings.toggleFridayLock(day.id);
    settings.saveDaySettings();
  };

  return (
    <div
      className={clsx(
        'day-column flex-shrink-0 flex flex-col rounded-xl overflow-hidden',
        'bg-day-column-gradient shadow-card-lg border border-white/[0.03]',
        isFullScreen ? 'day-column-full sm:w-75 w-56' : 'sm:w-65 w-40',
        'sm:mr-2.5 mr-1'
      )}
      data-day-id={day.id}
    >
      {/* Header */}
      <div className="p-2 border-b border-white/5">
        <div className="flex items-center justify-between">
          <span className={clsx('text-xs font-semibold flex-1 text-center', isToday && 'text-accent')}>
            {day.label}
          </span>
          <button
            className="text-[10px] text-text-muted hover:text-accent"
            onClick={() => openCapEdit(day)}
          >
            {usedHours.toFixed(1)}/{capacity}h
          </button>
        </div>

        {/* Friday lock toggle */}
        {day.isFriday && activeView === 'fab' && (
          <button
            className={clsx(
              'mt-1 text-[10px] px-2 py-0.5 rounded',
              isLocked
                ? 'bg-job-lime/20 text-job-lime'
                : 'bg-white/10 text-text-muted'
            )}
            onClick={handleFridayLockToggle}
          >
            {isLocked ? 'Screens only' : 'Unlocked'}
          </button>
        )}
      </div>

      {/* Body - Drop zone */}
      <div
        ref={containerRef}
        className={clsx(
          'flex-1 p-1.5 overflow-y-auto min-h-day-body relative'
        )}
        style={{ display: 'flex', flexDirection: 'column' }}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* Time indicator */}
        {timeLinePosition !== null && (
          <div
            className="absolute left-0 right-0 h-0.5 bg-now-line shadow-now-line z-10 pointer-events-none"
            style={{ top: `${timeLinePosition}%` }}
          >
            <span className="absolute -left-1 -top-2 text-[9px] text-now-line font-bold">
              Now
            </span>
          </div>
        )}

        {/* No capacity indicator */}
        {capacity === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="no-production-stripes w-full h-full rounded-lg border border-white/10 bg-black/40 flex items-center justify-center">
              <span className="text-sm font-semibold uppercase tracking-wide text-text">
                No production
              </span>
            </div>
          </div>
        )}

        {/* Job cards */}
      {segments.map((segment) => {
        const job = jobs.find((j) => j.id === segment.jobId);
        if (!job) return null;

        const heightPercent = capacity > 0 ? (segment.hours / capacity) * 100 : 0;
        const extraFraction = extraFractions?.[segment.jobId] ?? 0;

        return (
          <JobCard
            key={segment.jobId}
            job={job}
            hours={segment.hours}
            heightPercent={heightPercent}
            isCutView={activeView === 'cut'}
            extraFraction={extraFraction}
          />
        );
      })}

        {/* Remaining capacity spacer */}
        {capacity > usedHours && (
          <div
            className="flex-1"
            style={{ flex: `${capacity - usedHours} 0 auto`, minHeight: '20px' }}
          />
        )}

        {/* Empty state */}
        {segments.length === 0 && capacity > 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-text-muted/30 text-xs pointer-events-none">
            Drop jobs here
          </div>
        )}
      </div>

      {/* Day Note */}
      <DayNote dayId={day.id} />
    </div>
  );
}

interface DayNoteProps {
  dayId: string;
}

function DayNote({ dayId }: DayNoteProps) {
  const dayNotes = useSettingsStore((state) => state.dayNotes);
  const setDayNote = useSettingsStore((state) => state.setDayNote);
  const saveDaySettings = useSettingsStore((state) => state.saveDaySettings);
  const isFullScreen = useUIStore((state) => state.isFullScreen);
  const startEditing = useUIStore((state) => state.startEditing);
  const stopEditing = useUIStore((state) => state.stopEditing);

  const note = dayNotes[dayId] || '';
  const hasNote = note.trim().length > 0;
  const charCount = note.length;
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startedEditingRef = useRef(false);
  const isMountedRef = useRef(true);
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

  const adjustHeight = useCallback(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto';
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  }, []);

  // Dynamically scale font size: shorter notes appear larger to fill the space.
  const fontSize =
    charCount <= 20 ? '18px' : charCount <= 60 ? '16px' : charCount <= 120 ? '14px' : '12px';

  const isHidden = isFullScreen && !hasNote;

  const flushSave = useCallback(async () => {
    setIsSaving(true);
    try {
      await saveDaySettings();
      if (isMountedRef.current) {
        setLastSavedAt(Date.now());
      }
    } finally {
      if (isMountedRef.current) {
        setIsSaving(false);
      }
    }
  }, [saveDaySettings]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const updated = e.target.value.toUpperCase();
    setDayNote(dayId, updated);
    adjustHeight();

    // If the note is cleared out, persist the removal immediately since the field hides.
    if (updated.trim().length === 0) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
      flushSave();
      return;
    }

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      flushSave();
    }, 800);
  };

  const handleBlur = () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    flushSave().finally(() => {
      if (startedEditingRef.current) {
        stopEditing('day-note');
        startedEditingRef.current = false;
      }
    });
  };

  const handleFocus = () => {
    startEditing('day-note');
    startedEditingRef.current = true;
  };

  useEffect(() => {
    isMountedRef.current = true;
    adjustHeight();
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
      isMountedRef.current = false;
      if (startedEditingRef.current) {
        stopEditing('day-note');
        startedEditingRef.current = false;
      }
    };
  }, [stopEditing, adjustHeight]);

  useEffect(() => {
    adjustHeight();
  }, [note, adjustHeight]);

  return (
    <div
      className={clsx(
        'border-t border-white/5 p-1.5',
        isHidden && 'hidden'
      )}
    >
      <textarea
        ref={textAreaRef}
        className={clsx(
          'w-full min-h-16 resize-none rounded-lg p-2 text-center',
          'bg-bg-softer/50 border border-white/5',
          'text-gold-border text-xs placeholder:text-text-muted/30',
          'focus:outline-none focus:border-accent/50'
        )}
        placeholder="Day notes..."
        value={note}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        style={{
          fontSize,
          lineHeight: 1.3,
          textTransform: 'uppercase',
        }}
      />
      <div className="mt-1 text-[10px] text-text-muted text-right">
        {isSaving ? 'Saving…' : lastSavedAt ? 'Saved' : ''}
      </div>
    </div>
  );
}
