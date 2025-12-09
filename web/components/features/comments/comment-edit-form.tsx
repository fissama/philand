'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { updateComment } from '@/lib/comment-api';
import type { Comment, BudgetMember } from '@/lib/comment-types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, X, AtSign } from 'lucide-react';
import { MentionSelector } from './mention-selector';
import { toast } from 'sonner';

interface CommentEditFormProps {
  comment: Comment;
  budgetId: string;
  entryId: string;
  budgetMembers: BudgetMember[];
  onSuccess: (comment: Comment) => void;
  onCancel: () => void;
}

export function CommentEditForm({
  comment,
  budgetId,
  entryId,
  budgetMembers,
  onSuccess,
  onCancel,
}: CommentEditFormProps) {
  const t = useTranslations('comments');
  const [text, setText] = useState(comment.comment_text);
  const [mentions, setMentions] = useState<string[]>(
    comment.mentions.map((m) => m.user_id)
  );
  const [submitting, setSubmitting] = useState(false);
  const [showMentions, setShowMentions] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      toast.error(t('emptyComment'));
      return;
    }

    setSubmitting(true);
    try {
      const updatedComment = await updateComment(budgetId, entryId, comment.id, {
        comment_text: text,
        mention_user_ids: mentions.length > 0 ? mentions : undefined,
      });

      onSuccess(updatedComment);
      toast.success(t('updateSuccess'));
    } catch (error) {
      console.error('Failed to update comment:', error);
      toast.error(t('updateError'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border bg-white p-4 shadow-sm">
      <div className="space-y-3">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t('placeholder')}
          className="min-h-[100px] resize-none"
          disabled={submitting}
          autoFocus
        />

        {mentions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {mentions.map((userId) => {
              const member = budgetMembers.find((m) => m.user_id === userId);
              if (!member) return null;
              return (
                <div
                  key={userId}
                  className="flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-sm"
                >
                  <span className="text-blue-700">@{member.user_name}</span>
                  <button
                    type="button"
                    onClick={() => setMentions(mentions.filter((id) => id !== userId))}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex items-center justify-between gap-2">
          <div className="relative">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowMentions(!showMentions)}
              disabled={submitting}
            >
              <AtSign className="h-4 w-4" />
              <span className="ml-2">
                {t('mention')} {mentions.length > 0 && `(${mentions.length})`}
              </span>
            </Button>

            {showMentions && (
              <MentionSelector
                members={budgetMembers}
                selected={mentions}
                onChange={setMentions}
                onClose={() => setShowMentions(false)}
              />
            )}
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={submitting}
            >
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={!text.trim() || submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('saving')}
                </>
              ) : (
                t('save')
              )}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
