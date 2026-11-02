import React from 'react';
import { cn } from '../../lib/utils';

export function SkeletonLoader({ className, variant = 'rect' }) {
  const variants = {
    rect: 'rounded-card',
    circle: 'rounded-full',
    text: 'h-4 rounded-pill',
  };

  return (
    <div
      className={cn(
        'animate-pulse bg-line/60 dark:bg-line/40',
        variants[variant],
        className
      )}
    />
  );
}

export function FrameCardSkeleton() {
  return (
    <div className="bg-surface border border-line rounded-card overflow-hidden p-3 space-y-3">
      <SkeletonLoader className="w-full aspect-[4/5]" />
      <div className="space-y-2">
        <SkeletonLoader variant="text" className="w-3/4" />
        <SkeletonLoader variant="text" className="w-1/2" />
      </div>
      <div className="flex justify-between items-center pt-2">
        <SkeletonLoader variant="circle" className="w-6 h-6" />
        <SkeletonLoader variant="text" className="w-16" />
      </div>
    </div>
  );
}

