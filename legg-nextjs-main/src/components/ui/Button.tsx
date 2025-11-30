'use client';

import { clsx } from 'clsx';
import type { ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'ghost' | 'primary' | 'secondary' | 'danger';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: 'sm' | 'md';
}

const variantStyles: Record<ButtonVariant, string> = {
  ghost: 'border border-border bg-transparent text-text hover:border-accent hover:text-accent',
  primary: 'bg-accent text-bg font-semibold hover:brightness-110',
  secondary: 'border border-border bg-bg-soft text-text hover:border-accent hover:text-accent',
  danger: 'bg-danger text-white font-semibold hover:brightness-110',
};

export function Button({
  variant = 'ghost',
  size = 'md',
  className,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        'rounded-pill cursor-pointer transition-colors',
        size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-xs',
        variantStyles[variant],
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
