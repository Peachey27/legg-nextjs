'use client';

import { useState, useEffect } from 'react';
import { Modal, ModalActions, Button, Input } from '@/components/ui';
import { useUIStore } from '@/stores/uiStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { getDayCapacity } from '@/lib/utils/capacity';

export function CapacityModal() {
  const { capEditDay, closeCapEdit } = useUIStore();
  const settings = useSettingsStore();

  const [capacity, setCapacity] = useState('');
  const [useDefault, setUseDefault] = useState(true);

  const params = {
    monThuCapacity: settings.monThuCapacity,
    friUnlockedCapacity: settings.friUnlockedCapacity,
    friLockedCapacity: settings.friLockedCapacity,
    includeSaturday: settings.includeSaturday,
    saturdayCapacity: settings.saturdayCapacity,
    cutMonThuCapacity: settings.cutMonThuCapacity,
    cutFriCapacity: settings.cutFriCapacity,
    dayCapacityOverrides: {},
    fridayLocks: settings.fridayLocks,
  };

  // Calculate default capacity for this day
  const defaultCapacity = capEditDay ? getDayCapacity(capEditDay, params, 'fab') : 0;

  useEffect(() => {
    if (capEditDay) {
      const override = settings.dayCapacityOverrides[capEditDay.id];
      if (override !== undefined) {
        setCapacity(override.toString());
        setUseDefault(false);
      } else {
        setCapacity(defaultCapacity.toString());
        setUseDefault(true);
      }
    }
  }, [capEditDay, settings.dayCapacityOverrides, defaultCapacity]);

  const handleSave = async () => {
    if (!capEditDay) return;

    if (useDefault) {
      settings.setDayCapacityOverride(capEditDay.id, undefined);
    } else {
      settings.setDayCapacityOverride(capEditDay.id, Number(capacity) || 0);
    }

    await settings.saveDaySettings();
    closeCapEdit();
  };

  if (!capEditDay) return null;

  return (
    <Modal isOpen={!!capEditDay} onClose={closeCapEdit} title={`Edit Capacity: ${capEditDay.label}`}>
      <div className="space-y-4">
        <div className="text-xs text-text-muted">
          Default capacity for this day: {defaultCapacity}h
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={useDefault}
            onChange={(e) => setUseDefault(e.target.checked)}
            className="w-4 h-4"
          />
          <span className="text-xs text-text">Use default capacity</span>
        </label>

        {!useDefault && (
          <Input
            label="Custom Capacity (hours)"
            type="number"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            min="0"
            step="0.5"
          />
        )}
      </div>

      <ModalActions>
        <Button variant="ghost" onClick={closeCapEdit}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Save
        </Button>
      </ModalActions>
    </Modal>
  );
}
