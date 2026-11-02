import React from 'react';
import { Camera, Sparkles } from 'lucide-react';
import { Button } from './Button';

export function EmptyState({
  title = 'No frames found',
  description = 'Try adjusting your mood filters or searching for something else.',
  icon: Icon = Camera,
  actionText,
  onAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4 bg-surface/40 border border-dashed border-line rounded-card my-8">
      <div className="w-14 h-14 rounded-full bg-accent-soft/20 flex items-center justify-center text-accent mb-4">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="font-serif text-lg text-ink font-medium mb-1">{title}</h3>
      <p className="text-xs text-muted max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {actionText && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
}

