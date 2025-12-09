'use client';

import { useState, useEffect } from 'react';
import { Modal, ModalActions, Button, Input } from '@/components/ui';
import { useUIStore } from '@/stores/uiStore';
import { useSettingsStore } from '@/stores/settingsStore';

export function SettingsModal() {
  const { settingsOpen, closeSettings } = useUIStore();
  const settings = useSettingsStore();

  const [monThu, setMonThu] = useState('');
  const [friUnlocked, setFriUnlocked] = useState('');
  const [friLocked, setFriLocked] = useState('');
  const [includeSaturday, setIncludeSaturday] = useState(false);
  const [saturdayCap, setSaturdayCap] = useState('');
  const [cutMonThu, setCutMonThu] = useState('');
  const [cutFri, setCutFri] = useState('');

  // Populate on open
  useEffect(() => {
    if (settingsOpen) {
      setMonThu(settings.monThuCapacity.toString());
      setFriUnlocked(settings.friUnlockedCapacity.toString());
      setFriLocked(settings.friLockedCapacity.toString());
      setIncludeSaturday(settings.includeSaturday);
      setSaturdayCap(settings.saturdayCapacity.toString());
      setCutMonThu(settings.cutMonThuCapacity.toString());
      setCutFri(settings.cutFriCapacity.toString());
    }
  }, [settingsOpen, settings]);

  const handleSave = async () => {
    await settings.updateSettings({
      monThuCapacity: Number(monThu) || 13,
      friUnlockedCapacity: Number(friUnlocked) || 13,
      friLockedCapacity: Number(friLocked) || 4,
      includeSaturday,
      saturdayCapacity: Number(saturdayCap) || 8,
      cutMonThuCapacity: Number(cutMonThu) || 10,
      cutFriCapacity: Number(cutFri) || 0,
    });
    closeSettings();
  };

  const handleExport = async () => {
    try {
      const response = await fetch('/api/state/export');
      const data = await response.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `legg-schedule-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export data');
    }
  };

  const handleImport = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const data = JSON.parse(text);

        if (confirm('This will replace all current data. Are you sure?')) {
          const response = await fetch('/api/state/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });

          if (response.ok) {
            window.location.reload();
          } else {
            throw new Error('Import failed');
          }
        }
      } catch (error) {
        console.error('Import failed:', error);
        alert('Failed to import data');
      }
    };
    input.click();
  };

  return (
    <Modal isOpen={settingsOpen} onClose={closeSettings} title="Settings">
      <div className="space-y-4">
        {/* Fab Capacity */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wide">
            Fab View Capacity
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <Input
              label="Mon-Thu"
              type="number"
              value={monThu}
              onChange={(e) => setMonThu(e.target.value)}
              min="0"
            />
            <Input
              label="Fri (Unlocked)"
              type="number"
              value={friUnlocked}
              onChange={(e) => setFriUnlocked(e.target.value)}
              min="0"
            />
          </div>
          <Input
            label="Fri (Locked/Screens)"
            type="number"
            value={friLocked}
            onChange={(e) => setFriLocked(e.target.value)}
            min="0"
          />
        </div>

        {/* Saturday */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeSaturday}
              onChange={(e) => setIncludeSaturday(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-xs text-text">Include Saturday</span>
          </label>
          {includeSaturday && (
            <Input
              label="Saturday Capacity"
              type="number"
              value={saturdayCap}
              onChange={(e) => setSaturdayCap(e.target.value)}
              min="0"
            />
          )}
        </div>

        {/* Cut Capacity */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wide">
            Cut & Prep Capacity
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <Input
              label="Mon-Thu"
              type="number"
              value={cutMonThu}
              onChange={(e) => setCutMonThu(e.target.value)}
              min="0"
            />
            <Input
              label="Friday"
              type="number"
              value={cutFri}
              onChange={(e) => setCutFri(e.target.value)}
              min="0"
            />
          </div>
        </div>

        {/* Import/Export */}
        <div className="space-y-2 border-t border-border pt-4">
          <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wide">
            Data
          </h4>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={handleExport}>
              Export JSON
            </Button>
            <Button variant="ghost" onClick={handleImport}>
              Import JSON
            </Button>
          </div>
          <p className="text-[11px] text-text-muted">
            Files are stored at <span className="font-semibold">J:\Scheduler Backup files</span>
          </p>
        </div>
      </div>

      <ModalActions>
        <Button variant="ghost" onClick={closeSettings}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Save
        </Button>
      </ModalActions>
    </Modal>
  );
}
