// Comment and attachment types for the frontend

export interface Comment {
  id: string;
  entry_id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  user_avatar: string | null;
  comment_text: string;
  mentions: MentionedUser[];
  attachments: CommentAttachment[];
  created_at: string;
  updated_at: string;
}

export interface MentionedUser {
  user_id: string;
  user_name: string;
  user_email: string;
  user_avatar: string | null;
}

export interface CommentAttachment {
  id: string;
  file_url: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  created_at: string;
}

export interface CreateCommentRequest {
  comment_text: string;
  mention_user_ids?: string[];
  attachment_ids?: string[];
}

export interface UpdateCommentRequest {
  comment_text: string;
  mention_user_ids?: string[];
}

export interface UploadAttachmentRequest {
  file_data: string; // base64
  file_name: string;
}

export interface UploadAttachmentResponse {
  id: string;
  file_url: string;
  file_name: string;
  file_size: number;
  mime_type: string;
}

export interface BudgetMember {
  user_id: string;
  user_name: string;
  user_email: string;
  user_avatar: string | null;
  role: string;
}
