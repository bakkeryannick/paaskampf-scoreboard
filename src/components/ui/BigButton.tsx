import { clsx } from 'clsx';
import type { ButtonHTMLAttributes } from 'react';

interface BigButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function BigButton({
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: BigButtonProps) {
  return (
    <button
      className={clsx(
        'font-semibold rounded-xl transition-colors active:scale-95 disabled:opacity-50 disabled:pointer-events-none',
        {
          'bg-blue-600 text-white hover:bg-blue-500': variant === 'primary',
          'bg-slate-700 text-slate-200 hover:bg-slate-600': variant === 'secondary',
          'bg-red-600 text-white hover:bg-red-500': variant === 'danger',
          'bg-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800': variant === 'ghost',
        },
        {
          'min-h-10 px-3 text-sm': size === 'sm',
          'min-h-12 px-4 text-base': size === 'md',
          'min-h-14 px-6 text-lg': size === 'lg',
        },
        className
      )}
      {...props}
    />
  );
}
