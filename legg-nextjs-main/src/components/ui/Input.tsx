'use client';

import { clsx } from 'clsx';
import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className, id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-semibold text-text-muted uppercase tracking-wide"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={clsx(
          'w-full px-2.5 py-2 rounded-lg',
          'bg-bg-softer border border-border',
          'text-text text-xs',
          'placeholder:text-text-muted/50',
          'focus:outline-none focus:border-accent',
          'transition-colors',
          className
        )}
        {...props}
      />
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export function Textarea({ label, className, id, ...props }: TextareaProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-semibold text-text-muted uppercase tracking-wide"
        >
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={clsx(
          'w-full px-2.5 py-2 rounded-lg resize-none',
          'bg-bg-softer border border-border',
          'text-text text-xs',
          'placeholder:text-text-muted/50',
          'focus:outline-none focus:border-accent',
          'transition-colors',
          className
        )}
        {...props}
      />
    </div>
  );
}
