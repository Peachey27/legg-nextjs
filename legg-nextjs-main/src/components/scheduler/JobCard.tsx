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
}

export function JobCard({ job, hours, heightPercent = 100, isCutView }: JobCardProps) {
  const { handleDragStart } = useDragDrop();
  const { openEditJob, setCopiedJob } = useUIStore();

  const totalHours = isCutView ? job.cutHours : job.totalHours;
  const isPartial = hours < totalHours;

  // Determine text size based on height
  const textSize = heightPercent > 50 ? 'big' : heightPercent > 25 ? 'medium' : heightPercent > 12 ? 'small' : 'tiny';

  const textStyles = {
    big: { title: 'text-base font-semibold', sub: 'text-sm', note: 'text-xs' },
    medium: { title: 'text-sm font-semibold', sub: 'text-xs', note: 'text-xs' },
    small: { title: 'text-xs font-semibold', sub: 'text-[10px]', note: 'text-[10px]' },
    tiny: { title: 'text-[10px] font-semibold', sub: 'text-[8px]', note: 'text-[8px]' },
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
      {/* Title */}
      <div className={clsx('font-semibold truncate', textStyles.title)}>
        {job.title.toUpperCase()}
      </div>

      {/* VQ + Hours */}
      <div className={clsx('flex items-center gap-1 flex-wrap', textStyles.sub)}>
        {job.vquote && <VQPill vquote={job.vquote} />}
        <span className={clsx(isPartial && 'text-yellow-600')}>
          {isPartial ? `${hours.toFixed(1)}/${totalHours}h` : `${totalHours}h`}
        </span>
        {job.type === 'screens' && (
          <span className="bg-job-lime/30 px-1 rounded text-job-lime">screens</span>
        )}
      </div>

      {/* Note preview */}
      {job.note && textSize !== 'tiny' && (
        <div className={clsx('truncate opacity-70', textStyles.note)}>
          {job.note}
        </div>
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

  const hours = activeView === 'cut' ? job.cutHours : job.totalHours;

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
        <span>{hours}h</span>
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
