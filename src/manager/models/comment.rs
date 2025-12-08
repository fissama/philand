use serde::{Deserialize, Serialize};
use sqlx::FromRow;

// ============ Comment Models ============

#[derive(Debug, Serialize, FromRow)]
pub struct EntryComment {
    pub id: String,
    pub entry_id: String,
    pub user_id: String,
    pub comment_text: String,
    pub created_at: chrono::NaiveDateTime,
    pub updated_at: chrono::NaiveDateTime,
    pub deleted_at: Option<chrono::NaiveDateTime>,
}

#[derive(Debug, Serialize)]
pub struct CommentWithDetails {
    pub id: String,
    pub entry_id: String,
    pub user_id: String,
    pub user_name: String,
    pub user_email: String,
    pub user_avatar: Option<String>,
    pub comment_text: String,
    pub mentions: Vec<MentionedUser>,
    pub attachments: Vec<CommentAttachment>,
    pub created_at: chrono::NaiveDateTime,
    pub updated_at: chrono::NaiveDateTime,
}

#[derive(Debug, Serialize, Clone)]
pub struct MentionedUser {
    pub user_id: String,
    pub user_name: String,
    pub user_email: String,
    pub user_avatar: Option<String>,
}

#[derive(Debug, Serialize, Clone)]
pub struct CommentAttachment {
    pub id: String,
    pub file_url: String,
    pub file_name: String,
    pub file_size: i32,
    pub mime_type: String,
    pub created_at: chrono::NaiveDateTime,
}

#[derive(Debug, Deserialize)]
pub struct CreateCommentReq {
    pub comment_text: String,
    pub mention_user_ids: Option<Vec<String>>,
    pub attachment_ids: Option<Vec<String>>, // Pre-uploaded attachment IDs
}

#[derive(Debug, Deserialize)]
pub struct UpdateCommentReq {
    pub comment_text: String,
    pub mention_user_ids: Option<Vec<String>>,
}

// ============ Attachment Models ============

#[derive(Debug, Serialize, FromRow)]
pub struct EntryAttachment {
    pub id: String,
    pub entry_id: String,
    pub comment_id: Option<String>,
    pub user_id: String,
    pub file_url: String,
    pub file_name: String,
    pub file_size: i32,
    pub mime_type: String,
    pub created_at: chrono::NaiveDateTime,
    pub deleted_at: Option<chrono::NaiveDateTime>,
}

#[derive(Debug, Serialize)]
pub struct AttachmentWithUser {
    pub id: String,
    pub entry_id: String,
    pub comment_id: Option<String>,
    pub user_id: String,
    pub user_name: String,
    pub user_avatar: Option<String>,
    pub file_url: String,
    pub file_name: String,
    pub file_size: i32,
    pub mime_type: String,
    pub created_at: chrono::NaiveDateTime,
}

#[derive(Debug, Deserialize)]
pub struct UploadAttachmentReq {
    pub file_data: String, // base64 encoded image
    pub file_name: String,
}

#[derive(Debug, Serialize)]
pub struct UploadAttachmentResp {
    pub id: String,
    pub file_url: String,
    pub file_name: String,
    pub file_size: i32,
    pub mime_type: String,
}

// ============ Mention Models ============

#[derive(Debug, Serialize, FromRow)]
pub struct CommentMention {
    pub id: String,
    pub comment_id: String,
    pub mentioned_user_id: String,
    pub created_at: chrono::NaiveDateTime,
}
