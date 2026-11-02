import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

export const Button = forwardRef(
  (
    {
      children,
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled = false,
      icon: Icon,
      iconRight: IconRight,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-pill transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] select-none';

    const variants = {
      primary:
        'bg-accent text-white hover:bg-accent-hover shadow-warm-sm hover:shadow-warm-md',
      secondary:
        'bg-surface text-ink border border-line hover:border-accent hover:text-accent shadow-warm-sm',
      outline:
        'border border-line text-ink hover:border-accent hover:text-accent bg-transparent',
      ghost:
        'text-ink hover:text-accent hover:bg-surface/50 bg-transparent',
      subtle:
        'bg-accent-soft/20 text-accent hover:bg-accent-soft/35',
      dark:
        'bg-ink text-surface hover:opacity-90',
    };

    const sizes = {
      sm: 'text-2xs px-3.5 py-1.5 gap-1.5',
      md: 'text-xs px-5 py-2.5 gap-2',
      lg: 'text-sm px-6 py-3 gap-2.5',
      icon: 'p-2.5 rounded-full',
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        {!isLoading && Icon && <Icon className="w-4 h-4 shrink-0" />}
        {children}
        {!isLoading && IconRight && <IconRight className="w-4 h-4 shrink-0" />}
      </button>
    );
  }
);

Button.displayName = 'Button';

