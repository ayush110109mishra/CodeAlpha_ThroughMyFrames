import React, { useState } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { Button } from './Button';
import { formatDate } from '../../lib/utils';

export function CommentBox({ onSubmit, isSubmitting = false }) {
  const [content, setContent] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    onSubmit(content);
    setContent('');
  };

  return (
    <form onSubmit={handleSubmit} className="relative mt-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        placeholder="Share a quiet reflection or thought..."
        className="w-full p-3.5 bg-surface border border-line rounded-card text-xs text-ink placeholder:text-muted/70 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent resize-none transition-all shadow-warm-sm"
      />
      <div className="flex items-center justify-between mt-2">
        <span className="text-[11px] text-muted">
          Be kind, respectful and present.
        </span>
        <Button
          type="submit"
          size="sm"
          variant="primary"
          iconRight={Send}
          isLoading={isSubmitting}
          disabled={!content.trim()}
        >
          Reflect
        </Button>
      </div>
    </form>
  );
}

export function CommentItem({ comment }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-line/60 last:border-b-0">
      <img
        src={comment.author?.avatar}
        alt={comment.author?.name}
        className="w-8 h-8 rounded-full object-cover border border-line shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium text-ink">
            {comment.author?.name}
          </span>
          <span className="text-[11px] text-muted">
            @{comment.author?.username}
          </span>
          <span className="text-[10px] text-muted/60">•</span>
          <span className="text-[10px] text-muted">
            {formatDate(comment.createdAt)}
          </span>
        </div>
        <p className="text-xs text-ink/90 leading-relaxed font-sans">
          {comment.content}
        </p>
      </div>
    </div>
  );
}

