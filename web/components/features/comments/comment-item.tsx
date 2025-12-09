'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { formatDistanceToNow } from 'date-fns';
import { deleteComment } from '@/lib/comment-api';
import type { Comment, BudgetMember } from '@/lib/comment-types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Image as ImageIcon } from 'lucide-react';
import { CommentEditForm } from './comment-edit-form';
import { ImageModal } from './image-modal';
import { toast } from 'sonner';

interface CommentItemProps {
  comment: Comment;
  budgetId: string;
  entryId: string;
  budgetMembers: BudgetMember[];
  currentUserId: string;
  onUpdate: (comment: Comment) => void;
  onDelete: (commentId: string) => void;
}

export function CommentItem({
  comment,
  budgetId,
  entryId,
  budgetMembers,
  currentUserId,
  onUpdate,
  onDelete,
}: CommentItemProps) {
  const t = useTranslations('comments');
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const canEdit = comment.user_id === currentUserId;

  const handleDelete = async () => {
    if (!confirm(t('confirmDelete'))) return;

    setIsDeleting(true);
    try {
      await deleteComment(budgetId, entryId, comment.id);
      onDelete(comment.id);
      toast.success(t('deleteSuccess'));
    } catch (error) {
      console.error('Failed to delete comment:', error);
      toast.error(t('deleteError'));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdate = (updatedComment: Comment) => {
    onUpdate(updatedComment);
    setIsEditing(false);
  };

  const renderCommentText = (text: string) => {
    // Highlight mentions in the text
    let processedText = text;
    comment.mentions.forEach((mention) => {
      const mentionPattern = new RegExp(`@${mention.user_name}`, 'gi');
      processedText = processedText.replace(
        mentionPattern,
        `<span class="font-semibold text-blue-600 dark:text-blue-400">@${mention.user_name}</span>`
      );
    });
    return <span dangerouslySetInnerHTML={{ __html: processedText }} />;
  };

  if (isEditing) {
    return (
      <CommentEditForm
        comment={comment}
        budgetId={budgetId}
        entryId={entryId}
        budgetMembers={budgetMembers}
        onSuccess={handleUpdate}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  return (
    <>
      <div className="rounded-lg border bg-card p-4 shadow-sm">
        <div className="flex gap-3">
          <Avatar className="h-10 w-10 flex-shrink-0">
            <AvatarImage src={comment.user_avatar || undefined} />
            <AvatarFallback>
              {comment.user_name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-foreground">
                    {comment.user_name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.created_at), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground truncate block">
                  {comment.user_email}
                </span>
              </div>

              {canEdit && (
                <div className="flex gap-1 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    disabled={isDeleting}
                    className="h-8 w-8 p-0"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </div>

            <p className="text-sm text-foreground whitespace-pre-wrap break-words">
              {renderCommentText(comment.comment_text)}
            </p>

            {comment.attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {comment.attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="group relative cursor-pointer overflow-hidden rounded-lg border"
                    onClick={() => setSelectedImage(attachment.file_url)}
                  >
                    <img
                      src={attachment.file_url}
                      alt={attachment.file_name}
                      className="h-32 w-32 object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
                      <ImageIcon className="h-6 w-6 text-white opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {comment.mentions.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {comment.mentions.map((mention) => (
                  <div
                    key={mention.user_id}
                    className="flex items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-950 px-2 py-1 text-xs"
                  >
                    <Avatar className="h-4 w-4">
                      <AvatarImage src={mention.user_avatar || undefined} />
                      <AvatarFallback className="text-[8px]">
                        {mention.user_name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-blue-700 dark:text-blue-300">@{mention.user_name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedImage && (
        <ImageModal
          imageUrl={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </>
  );
}
