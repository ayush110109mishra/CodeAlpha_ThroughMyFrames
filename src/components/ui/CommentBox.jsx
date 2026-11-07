import React, { useState } from 'react';
import { Send, Trash2, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from './Button';
import { formatDate } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';

export function CommentBox({ onSubmit, isSubmitting = false }) {
  const [content, setContent] = useState('');
  const { isAuthenticated } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    onSubmit(content);
    setContent('');
  };

  if (!isAuthenticated) {
    return (
      <div className="mt-4 p-5 rounded-2xl bg-surface border border-line text-center space-y-2">
        <p className="text-xs text-muted">Sign in to leave a reflection on this photograph.</p>
        <Link to="/login" className="inline-block">
          <Button variant="outline" size="sm" icon={LogIn}>
            Sign In to Reflect
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="relative mt-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        maxLength={500}
        placeholder="Share a quiet reflection or thought..."
        className="w-full p-3.5 bg-surface border border-line rounded-card text-xs text-ink placeholder:text-muted/70 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent resize-none transition-all shadow-warm-sm"
      />
      <div className="flex items-center justify-between mt-2">
        <span className="text-[11px] text-muted">
          Be kind, respectful and present ({content.length}/500).
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

export function CommentItem({ comment, onDelete, currentUserId, frameAuthorId, isAdmin = false }) {
  const commentAuthorId = comment.author?._id || comment.author?.id;
  const canDelete =
    Boolean(currentUserId) &&
    (currentUserId === commentAuthorId ||
      currentUserId === frameAuthorId ||
      isAdmin);

  return (
    <div className="group flex items-start gap-3 py-3 border-b border-line/60 last:border-b-0">
      <img
        src={comment.author?.avatar || '/images/honey.jpg'}
        alt={comment.author?.name}
        onError={(e) => {
          e.target.src = '/images/honey.jpg';
        }}
        className="w-8 h-8 rounded-full object-cover border border-line shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-ink">
              {comment.author?.name}
            </span>
            <span className="text-[11px] text-muted font-mono">
              @{comment.author?.username}
            </span>
            <span className="text-[10px] text-muted/60">•</span>
            <span className="text-[10px] text-muted">
              {formatDate(comment.createdAt)}
            </span>
          </div>

          {canDelete && onDelete && (
            <button
              onClick={() => onDelete(comment)}
              className="opacity-0 group-hover:opacity-100 p-1 text-muted hover:text-red-500 rounded transition-all focus:opacity-100"
              title="Delete reflection"
              aria-label="Delete reflection"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <p className="text-xs text-ink/90 leading-relaxed font-sans">
          {comment.content}
        </p>
      </div>
    </div>
  );
}
