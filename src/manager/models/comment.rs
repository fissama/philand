use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use chrono::NaiveDateTime;

// Helper functions for UTC serialization
fn serialize_datetime_as_utc<S>(dt: &NaiveDateTime, serializer: S) -> Result<S::Ok, S::Error>
where
    S: serde::Serializer,
{
    let utc_dt = dt.and_utc();
    serializer.serialize_str(&utc_dt.to_rfc3339())
}

fn serialize_optional_datetime_as_utc<S>(dt: &Option<NaiveDateTime>, serializer: S) -> Result<S::Ok, S::Error>
where
    S: serde::Serializer,
{
    match dt {
        Some(dt) => {
            let utc_dt = dt.and_utc();
            serializer.serialize_some(&utc_dt.to_rfc3339())
        }
        None => serializer.serialize_none(),
    }
}

// ============ Comment Models ============

#[derive(Debug, Serialize, FromRow)]
pub struct EntryComment {
    pub id: String,
    pub entry_id: String,
    pub user_id: String,
    pub comment_text: String,
    #[serde(serialize_with = "serialize_datetime_as_utc")]
    pub created_at: NaiveDateTime,
    #[serde(serialize_with = "serialize_datetime_as_utc")]
    pub updated_at: NaiveDateTime,
    #[serde(serialize_with = "serialize_optional_datetime_as_utc")]
    pub deleted_at: Option<NaiveDateTime>,
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
    #[serde(serialize_with = "serialize_datetime_as_utc")]
    pub created_at: NaiveDateTime,
    #[serde(serialize_with = "serialize_datetime_as_utc")]
    pub updated_at: NaiveDateTime,
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
    #[serde(serialize_with = "serialize_datetime_as_utc")]
    pub created_at: NaiveDateTime,
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

#[allow(dead_code)]
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
    #[serde(serialize_with = "serialize_datetime_as_utc")]
    pub created_at: NaiveDateTime,
    #[serde(serialize_with = "serialize_optional_datetime_as_utc")]
    pub deleted_at: Option<NaiveDateTime>,
}

#[allow(dead_code)]
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
    #[serde(serialize_with = "serialize_datetime_as_utc")]
    pub created_at: NaiveDateTime,
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

// #[derive(Debug, Serialize, FromRow)]
// pub struct CommentMention {
//     pub id: String,
//     pub comment_id: String,
//     pub mentioned_user_id: String,
//     pub created_at: chrono::NaiveDateTime,
// }
