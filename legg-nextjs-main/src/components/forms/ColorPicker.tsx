'use client';

import { clsx } from 'clsx';
import { JOB_COLORS } from '@/lib/constants';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {JOB_COLORS.map((color) => (
        <button
          key={color}
          type="button"
          className={clsx(
            'w-6 h-6 rounded-full border-2 transition-all',
            value === color
              ? 'border-white scale-110'
              : 'border-transparent hover:border-white/50'
          )}
          style={{ backgroundColor: color }}
          onClick={() => onChange(color)}
        />
      ))}
    </div>
  );
}
