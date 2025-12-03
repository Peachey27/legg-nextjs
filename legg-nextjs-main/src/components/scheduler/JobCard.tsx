'use client';

import { clsx } from 'clsx';
import { useDragDrop } from '@/hooks/useDragDrop';
import { useUIStore } from '@/stores/uiStore';
import { VQPill } from '@/components/ui';
import type { Job } from '@/types';

interface JobCardProps {
  job: Job;
  hours: number;
  heightPercent?: number;
  isCutView?: boolean;
  extraFraction?: number;
}

export function JobCard({ job, hours, heightPercent = 100, isCutView, extraFraction = 0 }: JobCardProps) {
  const { handleDragStart } = useDragDrop();
  const { openEditJob, setCopiedJob } = useUIStore();
  const isFullScreen = useUIStore((state) => state.isFullScreen);

  const totalHours = isCutView ? job.cutHours : job.totalHours;
  const extraHours = isCutView ? job.extraCutHours ?? 0 : job.extraHours ?? 0;
  const combinedHours = totalHours + extraHours;
  const isPartial = hours < combinedHours;
  const isBlackCard = (job.color || '').toLowerCase() === '#000000' || (job.color || '').toLowerCase() === 'black';

  // Determine text size based on height
  const textSize = heightPercent > 50 ? 'big' : heightPercent > 25 ? 'medium' : heightPercent > 12 ? 'small' : 'tiny';

  const textStyles = {
    big: { title: 'text-base font-semibold', sub: 'text-sm', note: 'text-sm font-semibold' },
    medium: { title: 'text-sm font-semibold', sub: 'text-xs', note: 'text-xs font-semibold' },
    small: { title: 'text-xs font-semibold', sub: 'text-[10px]', note: 'text-[10px] font-semibold' },
    tiny: { title: 'text-[10px] font-semibold', sub: 'text-[8px]', note: 'text-[8px] font-semibold' },
  }[textSize];

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCopiedJob({
      title: job.title,
      vquote: job.vquote,
      totalHours: job.totalHours,
      cutHours: job.cutHours,
      type: job.type,
      color: job.color,
      note: job.note,
    });
  };

  const showCenterLabel = hours >= 3;

  return (
    <div
      className={clsx(
        'rounded-lg p-1.5 cursor-grab select-none',
        'border-2 border-gold-border shadow-card',
        'flex flex-col gap-0.5 relative overflow-hidden',
        'text-bg',
        isCutView && 'cut-stripes'
      )}
      style={{
        backgroundColor: job.color,
        flex: `${hours} 0 auto`,
        minHeight: '40px',
      }}
      draggable
      onDragStart={(e) => handleDragStart(e, job.id)}
      onDoubleClick={() => openEditJob(job.id)}
    >
      {/* Large center title label (hidden for short segments < 3h) */}
      {showCenterLabel && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] pointer-events-none">
          <div
            className="text-3xl font-black uppercase text-center px-3 py-2 rounded-lg bg-black/35 text-bg shadow-card leading-tight break-words"
            style={{ wordBreak: 'normal', overflowWrap: 'break-word' }}
          >
            {job.type === 'screens' && job.note ? job.note : job.title}
          </div>
        </div>
      )}

      {/* Title */}
      <div className={clsx('font-semibold truncate', textStyles.title)}>
        {job.title.toUpperCase()}
      </div>

      {/* VQ + Hours */}
      <div className={clsx('flex items-center gap-1 flex-wrap', textStyles.sub)}>
        {job.vquote && <VQPill vquote={job.vquote} />}
        <span
          className={clsx(isPartial && 'text-yellow-600')}
          style={{ color: isBlackCard ? '#fff' : '#000' }}
        >
          {isPartial ? `${hours.toFixed(1)}/${combinedHours}h` : `${combinedHours}h`}
        </span>
        {job.type === 'screens' && (
          <span className="bg-job-lime/30 px-1 rounded text-job-lime">screens</span>
        )}
      </div>

      {/* Note preview */}
      {job.note && textSize !== 'tiny' && (
        <div
          className={clsx(
            'truncate',
            textStyles.note,
            isFullScreen && 'text-2xl font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)] uppercase'
          )}
          style={{
            color: '#ff3b6b',
            textTransform: isFullScreen ? 'uppercase' : undefined,
          }}
        >
          {job.note}
        </div>
      )}

      {/* Extra hours overlay (striped only for the extra portion) */}
      {extraFraction > 0 && (
        <div
          className="absolute left-0 right-0 bottom-0 pointer-events-none"
          style={{
            height: `${Math.min(100, extraFraction * 100)}%`,
            backgroundImage:
              'linear-gradient(135deg, rgba(255,255,255,0.25) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.25) 50%, rgba(255,255,255,0.25) 75%, transparent 75%, transparent)',
            backgroundSize: '12px 12px',
            borderTop: '1px solid rgba(255,255,255,0.2)',
          }}
        />
      )}

      {/* Copy button */}
      <button
        className="absolute top-1 right-1 w-5 h-5 rounded bg-black/20 text-white/80 hover:bg-black/40 text-xs flex items-center justify-center"
        onClick={handleCopy}
        title="Copy job"
      >
        ⎘
      </button>
    </div>
  );
}

interface BacklogJobProps {
  job: Job;
}

export function BacklogJob({ job }: BacklogJobProps) {
  const { handleDragStart } = useDragDrop();
  const { openEditJob, setCopiedJob } = useUIStore();
  const activeView = useUIStore((state) => state.activeView);

  const primaryHours = activeView === 'cut' ? job.cutHours : job.totalHours;
  const fallbackHours = activeView === 'cut' ? job.totalHours : job.cutHours;
  const hours = primaryHours > 0 ? primaryHours : fallbackHours;
  const isBlackCard = (job.color || '').toLowerCase() === '#000000' || (job.color || '').toLowerCase() === 'black';

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCopiedJob({
      title: job.title,
      vquote: job.vquote,
      totalHours: job.totalHours,
      cutHours: job.cutHours,
      type: job.type,
      color: job.color,
      note: job.note,
    });
  };

  return (
    <div
      className={clsx(
        'rounded-lg p-2 cursor-grab select-none',
        'border border-white/20 shadow-card',
        'text-bg relative'
      )}
      style={{ backgroundColor: job.color }}
      draggable
      onDragStart={(e) => handleDragStart(e, job.id)}
      onDoubleClick={() => openEditJob(job.id)}
    >
      <div className="font-semibold text-xs truncate">
        {job.title.toUpperCase()}
      </div>
      <div className="flex items-center gap-1 text-[10px] mt-0.5">
        {job.vquote && <VQPill vquote={job.vquote} />}
        <span style={{ color: isBlackCard ? '#fff' : '#000' }}>{hours}h</span>
        {job.type === 'screens' && (
          <span className="bg-job-lime/30 px-1 rounded text-job-lime">screens</span>
        )}
      </div>

      <button
        className="absolute top-1 right-1 w-4 h-4 rounded bg-black/20 text-white/80 hover:bg-black/40 text-[10px] flex items-center justify-center"
        onClick={handleCopy}
        title="Copy job"
      >
        ⎘
      </button>
    </div>
  );
}
