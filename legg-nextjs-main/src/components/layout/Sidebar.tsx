'use client';

import { clsx } from 'clsx';
import { AddJobForm } from '@/components/forms/AddJobForm';
import { BacklogJob } from '@/components/scheduler/JobCard';
import { useDragDrop } from '@/hooks/useDragDrop';
import type { Job } from '@/types';

interface SidebarProps {
  backlogJobs: Job[];
  isHidden?: boolean;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ backlogJobs, isHidden, isMobileOpen = false, onMobileClose }: SidebarProps) {
  const { handleDropToBacklog, handleDragOver } = useDragDrop();

  if (isHidden) return null;

  const mobileClasses = clsx(
    'lg:hidden',
    'fixed inset-0 z-30 bg-black/50',
    isMobileOpen ? 'block' : 'hidden'
  );

  const panelClasses = clsx(
    'w-[280px] flex-shrink-0 bg-sidebar-gradient border-r border-white/5 flex flex-col overflow-hidden',
    'h-full'
  );

  return (
    <>
      {/* Mobile overlay */}
      <div className={mobileClasses} onClick={onMobileClose}>
        <aside
          className={clsx(panelClasses, 'absolute left-0 top-0')}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-3 border-b border-white/5 flex items-center justify-between">
            <span className="text-sm font-semibold text-text">Menu</span>
            <button
              className="text-xs text-text-muted hover:text-accent"
              onClick={onMobileClose}
            >
              Close
            </button>
          </div>
          <SidebarBody backlogJobs={backlogJobs} handleDragOver={handleDragOver} handleDropToBacklog={handleDropToBacklog} />
        </aside>
      </div>

      {/* Desktop */}
      <aside className={clsx(panelClasses, 'hidden lg:flex')}>
        <SidebarBody backlogJobs={backlogJobs} handleDragOver={handleDragOver} handleDropToBacklog={handleDropToBacklog} />
      </aside>
    </>
  );
}

function SidebarBody({
  backlogJobs,
  handleDragOver,
  handleDropToBacklog,
}: {
  backlogJobs: Job[];
  handleDragOver: (e: React.DragEvent) => void;
  handleDropToBacklog: (e: React.DragEvent) => void;
}) {
  return (
    <>
      {/* Add Job Form */}
      <div className="p-3 border-b border-white/5">
        <AddJobForm />
      </div>

      {/* Backlog */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-3 py-2 text-xs font-semibold text-text-muted uppercase tracking-wide">
          Backlog ({backlogJobs.length})
        </div>

        <div
          className={clsx(
            'flex-1 overflow-y-auto p-2 space-y-2',
            'min-h-[100px]'
          )}
          onDragOver={handleDragOver}
          onDrop={handleDropToBacklog}
        >
          {backlogJobs.length === 0 ? (
            <div className="text-center text-text-muted text-xs py-8 opacity-50">
              Drop jobs here to unschedule
            </div>
          ) : (
            backlogJobs.map((job) => (
              <BacklogJob key={job.id} job={job} />
            ))
          )}
        </div>
      </div>
    </>
  );
}
