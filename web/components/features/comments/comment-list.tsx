'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { getComments } from '@/lib/comment-api';
import type { Comment, BudgetMember } from '@/lib/comment-types';
import { CommentItem } from './comment-item';
import { CommentForm } from './comment-form';
import { Loader2 } from 'lucide-react';

interface CommentListProps {
  budgetId: string;
  entryId: string;
  budgetMembers: BudgetMember[];
  currentUserId: string;
  canComment: boolean;
}

export function CommentList({
  budgetId,
  entryId,
  budgetMembers,
  currentUserId,
  canComment,
}: CommentListProps) {
  const t = useTranslations('comments');
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadComments = async () => {
    try {
      setError(null);
      const data = await getComments(budgetId, entryId);
      setComments(data);
    } catch (err) {
      console.error('Failed to load comments:', err);
      setError(t('loadError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, [budgetId, entryId]);

  const handleCommentAdded = (newComment: Comment) => {
    setComments([...comments, newComment]);
  };

  const handleCommentUpdated = (updatedComment: Comment) => {
    setComments(
      comments.map((c) => (c.id === updatedComment.id ? updatedComment : c))
    );
  };

  const handleCommentDeleted = (commentId: string) => {
    setComments(comments.filter((c) => c.id !== commentId));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-600 font-medium">{error}</p>
          <p className="text-xs text-red-500 mt-1">
            Make sure the backend is running and the database migration has been applied.
          </p>
          <button
            onClick={() => {
              setLoading(true);
              loadComments();
            }}
            className="mt-3 text-sm text-red-600 hover:text-red-700 underline"
          >
            Try again
          </button>
        </div>
        {canComment && (
          <div className="border-t pt-4">
            <CommentForm
              budgetId={budgetId}
              entryId={entryId}
              budgetMembers={budgetMembers}
              onSuccess={handleCommentAdded}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {comments.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
          {t('noComments')}
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              budgetId={budgetId}
              entryId={entryId}
              budgetMembers={budgetMembers}
              currentUserId={currentUserId}
              onUpdate={handleCommentUpdated}
              onDelete={handleCommentDeleted}
            />
          ))}
        </div>
      )}

      {canComment && (
        <div className={comments.length > 0 ? "border-t pt-4 mt-4" : ""}>
          <CommentForm
            budgetId={budgetId}
            entryId={entryId}
            budgetMembers={budgetMembers}
            onSuccess={handleCommentAdded}
          />
        </div>
      )}
    </div>
  );
}
