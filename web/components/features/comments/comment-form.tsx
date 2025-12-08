'use client';

import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { createComment, uploadAttachment, fileToBase64, validateImageFile } from '@/lib/comment-api';
import type { Comment, BudgetMember, UploadAttachmentResponse } from '@/lib/comment-types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Paperclip, X, Loader2, AtSign } from 'lucide-react';
import { MentionSelector } from './mention-selector';
import { toast } from 'sonner';

interface CommentFormProps {
  budgetId: string;
  entryId: string;
  budgetMembers: BudgetMember[];
  onSuccess: (comment: Comment) => void;
}

export function CommentForm({
  budgetId,
  entryId,
  budgetMembers,
  onSuccess,
}: CommentFormProps) {
  const t = useTranslations('comments');
  const [text, setText] = useState('');
  const [mentions, setMentions] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<UploadAttachmentResponse[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showMentions, setShowMentions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate files
    for (const file of files) {
      const error = validateImageFile(file);
      if (error) {
        toast.error(error);
        return;
      }
    }

    setUploading(true);
    try {
      const uploaded = await Promise.all(
        files.map(async (file) => {
          const base64 = await fileToBase64(file);
          return uploadAttachment(budgetId, entryId, {
            file_data: base64,
            file_name: file.name,
          });
        })
      );
      setAttachments([...attachments, ...uploaded]);
      toast.success(t('uploadSuccess'));
    } catch (error) {
      console.error('Failed to upload files:', error);
      toast.error(t('uploadError'));
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAttachment = (attachmentId: string) => {
    setAttachments(attachments.filter((a) => a.id !== attachmentId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      toast.error(t('emptyComment'));
      return;
    }

    setSubmitting(true);
    try {
      const newComment = await createComment(budgetId, entryId, {
        comment_text: text,
        mention_user_ids: mentions.length > 0 ? mentions : undefined,
        attachment_ids: attachments.length > 0 ? attachments.map((a) => a.id) : undefined,
      });

      setText('');
      setMentions([]);
      setAttachments([]);
      onSuccess(newComment);
      toast.success(t('createSuccess'));
    } catch (error) {
      console.error('Failed to create comment:', error);
      toast.error(t('createError'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      {/* Attachments Preview - Show above textarea */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 pb-2">
          {attachments.map((attachment) => (
            <div key={attachment.id} className="group relative">
              <img
                src={attachment.file_url}
                alt={attachment.file_name}
                className="h-16 w-16 rounded-md border object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemoveAttachment(attachment.id)}
                className="absolute -right-1 -top-1 rounded-full bg-red-500 p-0.5 text-white shadow-sm hover:bg-red-600"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Mentions Preview - Show above textarea */}
      {mentions.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pb-2">
          {mentions.map((userId) => {
            const member = budgetMembers.find((m) => m.user_id === userId);
            if (!member) return null;
            return (
              <div
                key={userId}
                className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs"
              >
                <span className="text-blue-700 font-medium">@{member.user_name}</span>
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

      {/* Textarea and Actions */}
      <div className="flex gap-2">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t('placeholder')}
          className="min-h-[80px] resize-none flex-1"
          disabled={submitting || uploading}
        />
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading || submitting}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || submitting}
            className="h-8"
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Paperclip className="h-4 w-4" />
            )}
          </Button>

          <div className="relative">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowMentions(!showMentions)}
              disabled={submitting}
              className="h-8"
            >
              <AtSign className="h-4 w-4" />
              {mentions.length > 0 && (
                <span className="ml-1 text-xs">({mentions.length})</span>
              )}
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
        </div>

        <Button
          type="submit"
          disabled={!text.trim() || submitting || uploading}
          size="sm"
          className="h-8"
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
              {t('posting')}
            </>
          ) : (
            t('post')
          )}
        </Button>
      </div>
    </form>
  );
}
