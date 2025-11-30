'use client';

import { useState } from 'react';
import { clsx } from 'clsx';
import { Button, Input, Textarea } from '@/components/ui';
import { ColorPicker } from './ColorPicker';
import { useJobStore } from '@/stores/jobStore';
import { useUIStore } from '@/stores/uiStore';
import { DEFAULT_JOB_COLOR } from '@/lib/constants';
import type { JobType } from '@/types';

export function AddJobForm() {
  const addJob = useJobStore((state) => state.addJob);
  const jobs = useJobStore((state) => state.jobs);
  const { copiedJobTemplate, clearCopiedJob } = useUIStore();

  const [title, setTitle] = useState('');
  const [vquote, setVquote] = useState('');
  const [totalHours, setTotalHours] = useState('');
  const [cutHours, setCutHours] = useState('');
  const [jobType, setJobType] = useState<JobType>('windows');
  const [color, setColor] = useState<string>(DEFAULT_JOB_COLOR);
  const [note, setNote] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const hours = Number(totalHours) || 0;
    const cut = Number(cutHours) || 0;

    if (!title.trim() || !vquote.trim() || (hours <= 0 && cut <= 0)) {
      alert('Please enter a title, VQuote, and at least one set of hours > 0.');
      return;
    }

    // Calculate max orders
    const maxOrderFab = jobs.reduce((m, j) => Math.max(m, j.order), 0);
    const maxOrderCut = jobs.reduce((m, j) => Math.max(m, j.cutOrder), 0);

    await addJob({
      title: title.trim(),
      vquote: vquote.trim(),
      totalHours: hours,
      cutHours: cut,
      type: jobType,
      color,
      note: note.trim(),
      startDayId: null,
      order: maxOrderFab + 1,
      cutStartDayId: null,
      cutOrder: maxOrderCut + 1,
    });

    // Reset form
    setTitle('');
    setVquote('');
    setTotalHours('');
    setCutHours('');
    setNote('');
  };

  const handlePaste = async () => {
    if (!copiedJobTemplate) return;

    const maxOrderFab = jobs.reduce((m, j) => Math.max(m, j.order), 0);
    const maxOrderCut = jobs.reduce((m, j) => Math.max(m, j.cutOrder), 0);

    await addJob({
      title: copiedJobTemplate.title,
      vquote: copiedJobTemplate.vquote,
      totalHours: copiedJobTemplate.totalHours,
      cutHours: copiedJobTemplate.cutHours,
      type: copiedJobTemplate.type,
      color: copiedJobTemplate.color,
      note: copiedJobTemplate.note,
      startDayId: null,
      order: maxOrderFab + 1,
      cutStartDayId: null,
      cutOrder: maxOrderCut + 1,
    });

    clearCopiedJob();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide">
        Add Job
      </h3>

      <Input
        label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Client name"
      />

      <Input
        label="VQuote"
        value={vquote}
        onChange={(e) => setVquote(e.target.value)}
        placeholder="Quote number"
      />

      <div className="grid grid-cols-2 gap-2">
        <Input
          label="Fab Hours"
          type="number"
          value={totalHours}
          onChange={(e) => setTotalHours(e.target.value)}
          placeholder="0"
          min="0"
          step="0.5"
        />
        <Input
          label="Cut Hours"
          type="number"
          value={cutHours}
          onChange={(e) => setCutHours(e.target.value)}
          placeholder="0"
          min="0"
          step="0.5"
        />
      </div>

      {/* Job Type */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-text-muted uppercase tracking-wide">
          Type
        </label>
        <div className="flex gap-1">
          <button
            type="button"
            className={clsx(
              'flex-1 py-1.5 text-xs rounded-lg border transition-colors',
              jobType === 'windows'
                ? 'bg-accent text-bg border-accent'
                : 'bg-transparent text-text border-border hover:border-accent'
            )}
            onClick={() => setJobType('windows')}
          >
            Windows
          </button>
          <button
            type="button"
            className={clsx(
              'flex-1 py-1.5 text-xs rounded-lg border transition-colors',
              jobType === 'screens'
                ? 'bg-job-lime text-bg border-job-lime'
                : 'bg-transparent text-text border-border hover:border-job-lime'
            )}
            onClick={() => setJobType('screens')}
          >
            Screens
          </button>
        </div>
      </div>

      {/* Color Picker */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-text-muted uppercase tracking-wide">
          Color
        </label>
        <ColorPicker value={color} onChange={setColor} />
      </div>

      {/* Note */}
      <Textarea
        label="Note"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Optional note..."
        rows={2}
      />

      {/* Actions */}
      <div className="flex gap-2">
        <Button type="submit" variant="primary" className="flex-1">
          Add to Backlog
        </Button>
        {copiedJobTemplate && (
          <Button type="button" variant="secondary" onClick={handlePaste}>
            Paste
          </Button>
        )}
      </div>
    </form>
  );
}
