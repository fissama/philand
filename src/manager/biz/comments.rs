use crate::manager::models::comment::{
    CommentWithDetails, CreateCommentReq, UpdateCommentReq, UploadAttachmentReq, UploadAttachmentResp,
};
use crate::manager::models::notification::CreateNotificationReq;
use crate::manager::repository::{comments::CommentRepo, attachments::AttachmentRepo, notifications::NotificationRepo};
use crate::utils::{database::database::DbPool, error::error::AppError, s3_storage::get_s3_client, image_processor::ImageProcessor};
use sqlx::Row;

pub struct CommentService;

impl CommentService {
    /// List all comments for an entry
    pub async fn list_by_entry(
        pool: &DbPool,
        entry_id: &str,
        user_id: &str,
        budget_id: &str,
    ) -> Result<Vec<CommentWithDetails>, AppError> {
        // Verify user has access to this budget
        Self::verify_budget_access(pool, budget_id, user_id).await?;
        
        CommentRepo::list_by_entry(pool, entry_id).await
    }

    /// Create a new comment
    pub async fn create(
        pool: &DbPool,
        entry_id: &str,
        budget_id: &str,
        user_id: &str,
        req: CreateCommentReq,
    ) -> Result<CommentWithDetails, AppError> {
        // Verify user has access to this budget
        Self::verify_budget_access(pool, budget_id, user_id).await?;

        // Validate mentions are budget members
        if let Some(mention_ids) = &req.mention_user_ids {
            Self::validate_mentions(pool, budget_id, mention_ids).await?;
        }

        // Create comment
        let comment_id = CommentRepo::create(pool, entry_id, user_id, &req).await?;

        // Create notifications for mentioned users (async, don't block on errors)
        if let Some(mention_ids) = &req.mention_user_ids {
            for mentioned_user_id in mention_ids {
                // Don't notify if user mentions themselves
                if mentioned_user_id != user_id {
                    let _ = Self::create_mention_notification(
                        pool,
                        mentioned_user_id,
                        user_id,
                        budget_id,
                        entry_id,
                        &comment_id,
                        &req.comment_text,
                    ).await;
                }
            }
        }

        // Fetch and return the created comment with details
        let comments = CommentRepo::list_by_entry(pool, entry_id).await?;
        comments
            .into_iter()
            .find(|c| c.id == comment_id)
            .ok_or(AppError::Internal)
    }

    /// Update a comment
    pub async fn update(
        pool: &DbPool,
        comment_id: &str,
        user_id: &str,
        req: UpdateCommentReq,
    ) -> Result<CommentWithDetails, AppError> {
        // Verify access and get entry/budget info
        let (entry_id, budget_id) = CommentRepo::verify_access(pool, comment_id, user_id).await?;

        // Validate mentions are budget members
        if let Some(mention_ids) = &req.mention_user_ids {
            Self::validate_mentions(pool, &budget_id, mention_ids).await?;
        }

        // Update comment
        CommentRepo::update(pool, comment_id, user_id, &req).await?;

        // Fetch and return updated comment
        let comments = CommentRepo::list_by_entry(pool, &entry_id).await?;
        comments
            .into_iter()
            .find(|c| c.id == comment_id)
            .ok_or(AppError::Internal)
    }

    /// Delete a comment
    pub async fn delete(
        pool: &DbPool,
        comment_id: &str,
        user_id: &str,
    ) -> Result<(), AppError> {
        CommentRepo::delete(pool, comment_id, user_id).await?;
        Ok(())
    }

    /// Upload an attachment for an entry
    pub async fn upload_attachment(
        pool: &DbPool,
        entry_id: &str,
        budget_id: &str,
        user_id: &str,
        req: UploadAttachmentReq,
    ) -> Result<UploadAttachmentResp, AppError> {
        // Verify user has access to this budget
        Self::verify_budget_access(pool, budget_id, user_id).await?;

        // Decode base64 image
        use base64::{engine::general_purpose, Engine as _};
        let image_data = general_purpose::STANDARD
            .decode(&req.file_data)
            .map_err(|_| AppError::BadRequest("Invalid base64 image data".to_string()))?;

        // Validate image size (max 5MB)
        if image_data.len() > 5 * 1024 * 1024 {
            return Err(AppError::BadRequest("Image size exceeds 5MB limit".to_string()));
        }

        // Process image (resize, compress, convert to WebP)
        let processor = ImageProcessor::new();
        let processed = processor.process_comment_image(&image_data)?;

        // Generate attachment ID
        let attachment_id = uuid::Uuid::new_v4().to_string();

        // Upload to S3
        let s3_client = get_s3_client()?;
        let file_url = s3_client
            .upload_comment_attachment(
                entry_id,
                &attachment_id,
                processed.data,
                "image/webp",
                "webp",
            )
            .await?;

        // Save to database (not linked to comment yet)
        let file_name = req.file_name.clone();
        let db_attachment_id = AttachmentRepo::create(
            pool,
            &attachment_id,
            entry_id,
            user_id,
            file_url.clone(),
            req.file_name,
            processed.size as i32,
            "image/webp".to_string(),
        )
        .await?;

        Ok(UploadAttachmentResp {
            id: db_attachment_id,
            file_url,
            file_name,
            file_size: processed.size as i32,
            mime_type: "image/webp".to_string(),
        })
    }

    /// Delete an attachment
    pub async fn delete_attachment(
        pool: &DbPool,
        attachment_id: &str,
        user_id: &str,
    ) -> Result<(), AppError> {
        // Delete from database
        let (_entry_id, file_url) = AttachmentRepo::delete(pool, attachment_id, user_id).await?;

        // Delete from S3
        let s3_client = get_s3_client()?;
        s3_client.delete_attachment(&file_url).await?;

        Ok(())
    }

    /// Verify user is a member of the budget
    async fn verify_budget_access(
        pool: &DbPool,
        budget_id: &str,
        user_id: &str,
    ) -> Result<(), AppError> {
        let result = sqlx::query(
            "SELECT 1 FROM budget_members WHERE budget_id = ? AND user_id = ?"
        )
        .bind(budget_id)
        .bind(user_id)
        .fetch_optional(pool)
        .await?;

        result.ok_or(AppError::Forbidden).map(|_| ())
    }

    /// Validate that all mentioned users are members of the budget
    async fn validate_mentions(
        pool: &DbPool,
        budget_id: &str,
        user_ids: &[String],
    ) -> Result<(), AppError> {
        for user_id in user_ids {
            let result = sqlx::query(
                "SELECT 1 FROM budget_members WHERE budget_id = ? AND user_id = ?"
            )
            .bind(budget_id)
            .bind(user_id)
            .fetch_optional(pool)
            .await?;

            if result.is_none() {
                return Err(AppError::BadRequest("Mentioned user is not a budget member".to_string()));
            }
        }
        Ok(())
    }

    /// Create a notification for a mentioned user
    async fn create_mention_notification(
        pool: &DbPool,
        mentioned_user_id: &str,
        commenter_id: &str,
        budget_id: &str,
        entry_id: &str,
        comment_id: &str,
        comment_text: &str,
    ) -> Result<(), AppError> {
        // Get commenter name
        let commenter = sqlx::query("SELECT name FROM users WHERE id = ?")
            .bind(commenter_id)
            .fetch_optional(pool)
            .await?;

        let commenter_name = commenter
            .and_then(|row| row.try_get::<String, _>("name").ok())
            .unwrap_or_else(|| "Someone".to_string());

        // Get entry description for context
        let entry = sqlx::query("SELECT description FROM entries WHERE id = ?")
            .bind(entry_id)
            .fetch_optional(pool)
            .await?;

        let entry_desc = entry
            .and_then(|row| row.try_get::<Option<String>, _>("description").ok().flatten())
            .unwrap_or_else(|| "an entry".to_string());

        // Truncate comment text for notification
        let preview = if comment_text.len() > 100 {
            format!("{}...", &comment_text[..100])
        } else {
            comment_text.to_string()
        };

        let notification = CreateNotificationReq {
            user_id: mentioned_user_id.to_string(),
            budget_id: budget_id.to_string(),
            notification_type: "comment_mention".to_string(),
            title: format!("{} mentioned you in a comment", commenter_name),
            message: format!("On \"{}\": {}", entry_desc, preview),
            link_url: Some(format!("/budgets/{}/entries?entry={}", budget_id, entry_id)),
            related_id: Some(comment_id.to_string()),
        };

        NotificationRepo::create(pool, notification).await?;
        Ok(())
    }
}
