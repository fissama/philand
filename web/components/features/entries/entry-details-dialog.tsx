'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { CommentItem } from '../comments/comment-item';
import { CommentForm } from '../comments/comment-form';
import { getComments } from '@/lib/comment-api';
import type { Entry } from '@/lib/api';
import type { Comment, BudgetMember } from '@/lib/comment-types';
import { MessageSquare, Calendar, Tag, Loader2 } from 'lucide-react';
import { formatMoney } from '@/lib/format';
import { format } from 'date-fns';

interface EntryDetailsDialogProps {
  entry: Entry | null;
  budgetId: string;
  budgetMembers: BudgetMember[];
  currentUserId: string;
  canComment: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EntryDetailsDialog({
  entry,
  budgetId,
  budgetMembers,
  currentUserId,
  canComment,
  open,
  onOpenChange,
}: EntryDetailsDialogProps) {
  const t = useTranslations('entry');
  const tc = useTranslations('comments');
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadComments = async () => {
    if (!entry) return;
    try {
      setError(null);
      setLoading(true);
      const data = await getComments(budgetId, entry.id);
      setComments(data);
    } catch (err) {
      console.error('Failed to load comments:', err);
      setError(tc('loadError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && entry) {
      loadComments();
    }
  }, [open, entry?.id]);

  const handleCommentAdded = (newComment: Comment) => {
    setComments([...comments, newComment]);
  };

  const handleCommentUpdated = (updatedComment: Comment) => {
    setComments(comments.map((c) => (c.id === updatedComment.id ? updatedComment : c)));
  };

  const handleCommentDeleted = (commentId: string) => {
    setComments(comments.filter((c) => c.id !== commentId));
  };

  if (!entry) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[85vh] p-0 gap-0 flex flex-col">
        {/* Header - Entry Details */}
        <div className="px-6 py-4 border-b">
          <div className="flex items-start gap-4 pr-8">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <h2 className="text-lg font-semibold truncate">
                  {entry.description || t('noDescription')}
                </h2>
              </div>
              
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <span className={`text-base font-bold ${entry.kind === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                    {entry.kind === 'income' ? '+' : '-'}
                    {formatMoney(entry.amount_minor / 100, entry.currency_code)}
                  </span>
                </div>
                
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{format(new Date(entry.entry_date), 'PP')}</span>
                </div>
                
                {entry.category_name && (
                  <div className="flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5" />
                    <span>{entry.category_name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Comment count */}
          <div className="mt-3 pt-3 border-t">
            <p className="text-sm font-medium text-muted-foreground">
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Loading comments...
                </span>
              ) : (
                <span>
                  {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Comments List - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-600 font-medium">{error}</p>
              <p className="text-xs text-red-500 mt-1">
                Make sure the backend is running and the database migration has been applied.
              </p>
              <button
                onClick={loadComments}
                className="mt-3 text-sm text-red-600 hover:text-red-700 underline"
              >
                Try again
              </button>
            </div>
          ) : comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground font-medium">No comments yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                {canComment ? 'Be the first to comment below' : 'No comments on this entry'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  budgetId={budgetId}
                  entryId={entry.id}
                  budgetMembers={budgetMembers}
                  currentUserId={currentUserId}
                  onUpdate={handleCommentUpdated}
                  onDelete={handleCommentDeleted}
                />
              ))}
            </div>
          )}
        </div>

        {/* Comment Form - Fixed at Bottom */}
        {canComment && (
          <div className="border-t bg-background px-6 py-4">
            <CommentForm
              budgetId={budgetId}
              entryId={entry.id}
              budgetMembers={budgetMembers}
              onSuccess={handleCommentAdded}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
