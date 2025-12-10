"use client";

import { useState, useEffect, useRef } from 'react';
import { clsx } from 'clsx';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { SchedulerGrid } from '@/components/scheduler/SchedulerGrid';
import { MobileFinder } from '@/components/scheduler/MobileFinder';
import { NotesPanel } from '@/components/scheduler/NotesPanel';
import { EditJobModal } from '@/components/modals/EditJobModal';
import { SettingsModal } from '@/components/modals/SettingsModal';
import { CapacityModal } from '@/components/modals/CapacityModal';
import { useJobStore } from '@/stores/jobStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useUIStore } from '@/stores/uiStore';
import { useSchedule } from '@/hooks/useSchedule';
import { startOfThisWeekMonday, addDays } from '@/lib/utils/dates';

export default function SchedulerApp() {
  const [startMonday, setStartMonday] = useState(() => startOfThisWeekMonday());
  const [isHydrated, setIsHydrated] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [isFinderOpen, setIsFinderOpen] = useState(false);

  const fetchJobs = useJobStore((state) => state.fetchJobs);
  const fetchSettings = useSettingsStore((state) => state.fetchSettings);
  const fetchDaySettings = useSettingsStore((state) => state.fetchDaySettings);
  const isFullScreen = useUIStore((state) => state.isFullScreen);
  const isEditing = useUIStore((state) => state.isEditing);

  const { days, schedule, backlogJobs, params } = useSchedule(startMonday);

  // Hydration and initial data fetch
  useEffect(() => {
    setIsHydrated(true);
    fetchJobs();
    fetchSettings();
    fetchDaySettings();
  }, [fetchJobs, fetchSettings, fetchDaySettings]);

  // Poll data periodically, but pause while any editor is active to avoid overwriting unsaved changes.
  useEffect(() => {
    const tick = () => {
      if (isEditing) return;
      fetchJobs();
      fetchSettings();
      fetchDaySettings();
    };

    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, [isEditing, fetchJobs, fetchSettings, fetchDaySettings]);

  // Navigation handlers
  const handlePrevWeek = () => {
    setStartMonday((prev) => addDays(prev, -7));
  };

  const handleThisWeek = () => {
    setStartMonday(startOfThisWeekMonday());
  };

  const handleNextWeek = () => {
    setStartMonday((prev) => addDays(prev, 7));
  };

  const handleSelectDay = (dayId: string) => {
    const container = scrollRef.current;
    if (!container) return;
    const target = container.querySelector(`[data-day-id="${dayId}"]`) as HTMLElement | null;
    if (!target) return;
    const left = target.offsetLeft - 12;
    container.scrollTo({ left: Math.max(left, 0), behavior: 'smooth' });
    setIsFinderOpen(false);
  };

  // Prevent SSR flash
  if (!isHydrated) {
    return (
      <div className="h-screen flex items-center justify-center bg-bg">
        <div className="text-text-muted">Loading...</div>
      </div>
    );
  }

  return (
    <div
      className={clsx(
        'h-screen flex flex-col',
        isFullScreen ? 'bg-app-fullscreen' : 'bg-app-gradient'
      )}
    >
      {/* Header */}
      <Header
        startMonday={startMonday}
        onPrevWeek={handlePrevWeek}
        onThisWeek={handleThisWeek}
        onNextWeek={handleNextWeek}
        onToggleSidebar={() => setIsSidebarOpen((v) => !v)}
        isSidebarOpen={isSidebarOpen}
        onOpenFinder={() => setIsFinderOpen(true)}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          backlogJobs={backlogJobs}
          isHidden={isFullScreen}
          isMobileOpen={isSidebarOpen}
          onMobileClose={() => setIsSidebarOpen(false)}
        />

        {/* Scheduler Grid */}
        <SchedulerGrid
          days={days}
          scheduleByDay={schedule.scheduleByDay}
          isFullScreen={isFullScreen}
          startMonday={startMonday}
          params={params}
          scrollRef={scrollRef}
        />

        {/* Notes Panel (fullscreen only) */}
        {isFullScreen && (
          <NotesPanel days={days} scheduleByDay={schedule.scheduleByDay} />
        )}

        {/* Mobile job finder (visible only on small screens) */}
        <MobileFinder
          days={days}
          scheduleByDay={schedule.scheduleByDay}
          onSelectDay={handleSelectDay}
          open={isFinderOpen}
          setOpen={setIsFinderOpen}
        />
      </div>

      {/* Modals */}
      <EditJobModal />
      <SettingsModal />
      <CapacityModal />
    </div>
  );
}
