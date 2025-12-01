'use client';

import { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { SchedulerGrid } from '@/components/scheduler/SchedulerGrid';
import { NotesPanel } from '@/components/scheduler/NotesPanel';
import { EditJobModal } from '@/components/modals/EditJobModal';
import { SettingsModal } from '@/components/modals/SettingsModal';
import { CapacityModal } from '@/components/modals/CapacityModal';
import { useJobStore } from '@/stores/jobStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useUIStore } from '@/stores/uiStore';
import { useSchedule } from '@/hooks/useSchedule';
import { startOfThisWeekMonday, addDays } from '@/lib/utils/dates';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const [startMonday, setStartMonday] = useState(() => startOfThisWeekMonday());
  const [isHydrated, setIsHydrated] = useState(false);
  const router = useRouter();

  const fetchJobs = useJobStore((state) => state.fetchJobs);
  const fetchSettings = useSettingsStore((state) => state.fetchSettings);
  const fetchDaySettings = useSettingsStore((state) => state.fetchDaySettings);
  const isFullScreen = useUIStore((state) => state.isFullScreen);

  const { days, schedule, backlogJobs } = useSchedule(startMonday);

  // Hydration and initial data fetch
  useEffect(() => {
    setIsHydrated(true);
    fetchJobs();
    fetchSettings();
    fetchDaySettings();
  }, [fetchJobs, fetchSettings, fetchDaySettings]);

  // Auto-refresh the app every 10 seconds
  useEffect(() => {
    const id = setInterval(() => {
      router.refresh();
    }, 10000);
    return () => clearInterval(id);
  }, [router]);

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
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar backlogJobs={backlogJobs} isHidden={isFullScreen} />

        {/* Scheduler Grid */}
        <SchedulerGrid
          days={days}
          scheduleByDay={schedule.scheduleByDay}
          isFullScreen={isFullScreen}
        />

        {/* Notes Panel (fullscreen only) */}
        {isFullScreen && (
          <NotesPanel days={days} scheduleByDay={schedule.scheduleByDay} />
        )}
      </div>

      {/* Modals */}
      <EditJobModal />
      <SettingsModal />
      <CapacityModal />
    </div>
  );
}
