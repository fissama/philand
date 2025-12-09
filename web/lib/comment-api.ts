// API functions for comments and attachments

import { apiRequest } from './api';
import type {
  Comment,
  CreateCommentRequest,
  UpdateCommentRequest,
  UploadAttachmentRequest,
  UploadAttachmentResponse,
} from './comment-types';

export async function getComments(
  budgetId: string,
  entryId: string
): Promise<Comment[]> {
  return apiRequest<Comment[]>(
    `/api/budgets/${budgetId}/entries/${entryId}/comments`,
    { method: 'GET' }
  );
}

export async function createComment(
  budgetId: string,
  entryId: string,
  data: CreateCommentRequest
): Promise<Comment> {
  return apiRequest<Comment>(
    `/api/budgets/${budgetId}/entries/${entryId}/comments`,
    {
      method: 'POST',
      body: data,
    }
  );
}

export async function updateComment(
  budgetId: string,
  entryId: string,
  commentId: string,
  data: UpdateCommentRequest
): Promise<Comment> {
  return apiRequest<Comment>(
    `/api/budgets/${budgetId}/entries/${entryId}/comments/${commentId}`,
    {
      method: 'PATCH',
      body: data,
    }
  );
}

export async function deleteComment(
  budgetId: string,
  entryId: string,
  commentId: string
): Promise<void> {
  await apiRequest(
    `/api/budgets/${budgetId}/entries/${entryId}/comments/${commentId}`,
    { method: 'DELETE' }
  );
}

// ============ Attachment API ============

export async function uploadAttachment(
  budgetId: string,
  entryId: string,
  data: UploadAttachmentRequest
): Promise<UploadAttachmentResponse> {
  return apiRequest<UploadAttachmentResponse>(
    `/api/budgets/${budgetId}/entries/${entryId}/attachments`,
    {
      method: 'POST',
      body: data,
    }
  );
}

export async function deleteAttachment(
  budgetId: string,
  entryId: string,
  attachmentId: string
): Promise<void> {
  await apiRequest(
    `/api/budgets/${budgetId}/entries/${entryId}/attachments/${attachmentId}`,
    { method: 'DELETE' }
  );
}

// ============ Helper Functions ============

export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function validateImageFile(file: File): string | null {
  // Check file type
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!validTypes.includes(file.type)) {
    return 'Please upload a valid image file (JPEG, PNG, WebP, or GIF)';
  }

  // Check file size (5MB max)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return 'Image size must be less than 5MB';
  }

  return null;
}
