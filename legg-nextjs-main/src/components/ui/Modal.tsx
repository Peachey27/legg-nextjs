'use client';

import { clsx } from 'clsx';
import { useEffect, type ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className={clsx(
          'w-[360px] max-w-[90vw] max-h-[90vh] overflow-y-auto',
          'bg-sidebar-gradient rounded-xl p-4',
          'border border-border shadow-modal',
          className
        )}
      >
        {title && (
          <h2 className="text-lg font-bold text-text mb-4">{title}</h2>
        )}
        {children}
      </div>
    </div>
  );
}

interface ModalActionsProps {
  children: ReactNode;
  className?: string;
}

export function ModalActions({ children, className }: ModalActionsProps) {
  return (
    <div className={clsx('flex gap-2 mt-4', className)}>
      {children}
    </div>
  );
}
