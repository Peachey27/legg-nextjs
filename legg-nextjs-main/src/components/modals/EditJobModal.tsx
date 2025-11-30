'use client';

import { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { Modal, ModalActions, Button, Input, Textarea } from '@/components/ui';
import { ColorPicker } from '@/components/forms/ColorPicker';
import { useUIStore } from '@/stores/uiStore';
import { useJobStore } from '@/stores/jobStore';
import type { JobType } from '@/types';

export function EditJobModal() {
  const { editingJobId, closeEditJob } = useUIStore();
  const jobs = useJobStore((state) => state.jobs);
  const updateJob = useJobStore((state) => state.updateJob);
  const deleteJob = useJobStore((state) => state.deleteJob);

  const job = jobs.find((j) => j.id === editingJobId);

  const [title, setTitle] = useState('');
  const [vquote, setVquote] = useState('');
  const [totalHours, setTotalHours] = useState('');
  const [cutHours, setCutHours] = useState('');
  const [jobType, setJobType] = useState<JobType>('windows');
  const [color, setColor] = useState('#ff6fae');
  const [note, setNote] = useState('');

  // Populate form when job changes
  useEffect(() => {
    if (job) {
      setTitle(job.title);
      setVquote(job.vquote);
      setTotalHours(job.totalHours.toString());
      setCutHours(job.cutHours.toString());
      setJobType(job.type);
      setColor(job.color);
      setNote(job.note);
    }
  }, [job]);

  const handleSave = async () => {
    if (!editingJobId) return;

    await updateJob(editingJobId, {
      title: title.trim(),
      vquote: vquote.trim(),
      totalHours: Number(totalHours) || 0,
      cutHours: Number(cutHours) || 0,
      type: jobType,
      color,
      note: note.trim(),
    });

    closeEditJob();
  };

  const handleDelete = async () => {
    if (!editingJobId) return;

    if (confirm('Are you sure you want to delete this job?')) {
      await deleteJob(editingJobId);
      closeEditJob();
    }
  };

  if (!job) return null;

  return (
    <Modal isOpen={!!editingJobId} onClose={closeEditJob} title="Edit Job">
      <div className="space-y-3">
        <Input
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <Input
          label="VQuote"
          value={vquote}
          onChange={(e) => setVquote(e.target.value)}
        />

        <div className="grid grid-cols-2 gap-2">
          <Input
            label="Fab Hours"
            type="number"
            value={totalHours}
            onChange={(e) => setTotalHours(e.target.value)}
            min="0"
            step="0.5"
          />
          <Input
            label="Cut Hours"
            type="number"
            value={cutHours}
            onChange={(e) => setCutHours(e.target.value)}
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
          rows={3}
        />
      </div>

      <ModalActions className="justify-between">
        <Button variant="danger" onClick={handleDelete}>
          Delete
        </Button>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={closeEditJob}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save
          </Button>
        </div>
      </ModalActions>
    </Modal>
  );
}
