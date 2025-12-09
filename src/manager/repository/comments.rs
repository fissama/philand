use crate::manager::models::comment::{
    EntryComment, CommentWithDetails, MentionedUser, CommentAttachment,
    CreateCommentReq, UpdateCommentReq,
};
use crate::utils::{database::database::DbPool, error::error::AppError};
use sqlx::Row;

pub struct CommentRepo;

impl CommentRepo {
    /// List all comments for an entry with user details, mentions, and attachments
    pub async fn list_by_entry(
        pool: &DbPool,
        entry_id: &str,
    ) -> Result<Vec<CommentWithDetails>, AppError> {
        // Get all comments for the entry
        let comments = sqlx::query_as::<_, EntryComment>(
            "SELECT c.* FROM entry_comments c \
             WHERE c.entry_id = ? AND c.deleted_at IS NULL \
             ORDER BY c.created_at ASC"
        )
        .bind(entry_id)
        .fetch_all(pool)
        .await?;

        let mut result = Vec::new();

        for comment in comments {
            // Get user details
            let user = sqlx::query(
                "SELECT u.id, u.name, u.email, u.avatar \
                 FROM users u WHERE u.id = ?"
            )
            .bind(&comment.user_id)
            .fetch_one(pool)
            .await?;

            // Get mentions
            let mentions = Self::get_mentions(pool, &comment.id).await?;

            // Get attachments
            let attachments = Self::get_comment_attachments(pool, &comment.id).await?;

            result.push(CommentWithDetails {
                id: comment.id,
                entry_id: comment.entry_id,
                user_id: comment.user_id,
                user_name: user.get("name"),
                user_email: user.get("email"),
                user_avatar: user.get("avatar"),
                comment_text: comment.comment_text,
                mentions,
                attachments,
                created_at: comment.created_at,
                updated_at: comment.updated_at,
            });
        }

        Ok(result)
    }

    /// Create a new comment
    pub async fn create(
        pool: &DbPool,
        entry_id: &str,
        user_id: &str,
        req: &CreateCommentReq,
    ) -> Result<String, AppError> {
        let comment_id = uuid::Uuid::new_v4().to_string();

        sqlx::query(
            "INSERT INTO entry_comments (id, entry_id, user_id, comment_text) \
             VALUES (?, ?, ?, ?)"
        )
        .bind(&comment_id)
        .bind(entry_id)
        .bind(user_id)
        .bind(&req.comment_text)
        .execute(pool)
        .await?;

        // Add mentions if provided
        if let Some(mention_ids) = &req.mention_user_ids {
            Self::add_mentions(pool, &comment_id, mention_ids).await?;
        }

        // Link attachments if provided
        if let Some(attachment_ids) = &req.attachment_ids {
            Self::link_attachments(pool, &comment_id, attachment_ids).await?;
        }

        // Update comment count
        Self::update_comment_count(pool, entry_id).await?;

        Ok(comment_id)
    }

    /// Update a comment
    pub async fn update(
        pool: &DbPool,
        comment_id: &str,
        user_id: &str,
        req: &UpdateCommentReq,
    ) -> Result<(), AppError> {
        let result = sqlx::query(
            "UPDATE entry_comments \
             SET comment_text = ?, updated_at = CURRENT_TIMESTAMP \
             WHERE id = ? AND user_id = ? AND deleted_at IS NULL"
        )
        .bind(&req.comment_text)
        .bind(comment_id)
        .bind(user_id)
        .execute(pool)
        .await?;

        if result.rows_affected() == 0 {
            return Err(AppError::NotFound);
        }

        // Update mentions
        sqlx::query("DELETE FROM comment_mentions WHERE comment_id = ?")
            .bind(comment_id)
            .execute(pool)
            .await?;

        if let Some(mention_ids) = &req.mention_user_ids {
            Self::add_mentions(pool, comment_id, mention_ids).await?;
        }

        Ok(())
    }

    /// Delete a comment (soft delete)
    pub async fn delete(
        pool: &DbPool,
        comment_id: &str,
        user_id: &str,
    ) -> Result<String, AppError> {
        // First, get the entry_id before deleting
        let entry_result = sqlx::query(
            "SELECT entry_id FROM entry_comments \
             WHERE id = ? AND user_id = ? AND deleted_at IS NULL"
        )
        .bind(comment_id)
        .bind(user_id)
        .fetch_optional(pool)
        .await?;

        let entry_id: String = match entry_result {
            Some(row) => row.get("entry_id"),
            None => return Err(AppError::NotFound),
        };

        // Now perform the soft delete
        let result = sqlx::query(
            "UPDATE entry_comments \
             SET deleted_at = CURRENT_TIMESTAMP \
             WHERE id = ? AND user_id = ? AND deleted_at IS NULL"
        )
        .bind(comment_id)
        .bind(user_id)
        .execute(pool)
        .await?;

        if result.rows_affected() == 0 {
            return Err(AppError::NotFound);
        }

        Self::update_comment_count(pool, &entry_id).await?;
        Ok(entry_id)
    }

    /// Get mentions for a comment
    async fn get_mentions(
        pool: &DbPool,
        comment_id: &str,
    ) -> Result<Vec<MentionedUser>, AppError> {
        let mentions = sqlx::query(
            "SELECT u.id, u.name, u.email, u.avatar \
             FROM comment_mentions cm \
             INNER JOIN users u ON cm.mentioned_user_id = u.id \
             WHERE cm.comment_id = ?"
        )
        .bind(comment_id)
        .fetch_all(pool)
        .await?;

        Ok(mentions
            .into_iter()
            .map(|row| MentionedUser {
                user_id: row.get("id"),
                user_name: row.get("name"),
                user_email: row.get("email"),
                user_avatar: row.get("avatar"),
            })
            .collect())
    }

    /// Add mentions to a comment
    async fn add_mentions(
        pool: &DbPool,
        comment_id: &str,
        user_ids: &[String],
    ) -> Result<(), AppError> {
        for user_id in user_ids {
            let mention_id = uuid::Uuid::new_v4().to_string();
            sqlx::query(
                "INSERT INTO comment_mentions (id, comment_id, mentioned_user_id) \
                 VALUES (?, ?, ?) \
                 ON DUPLICATE KEY UPDATE id = id"
            )
            .bind(&mention_id)
            .bind(comment_id)
            .bind(user_id)
            .execute(pool)
            .await?;
        }
        Ok(())
    }

    /// Get attachments for a comment
    async fn get_comment_attachments(
        pool: &DbPool,
        comment_id: &str,
    ) -> Result<Vec<CommentAttachment>, AppError> {
        let attachments = sqlx::query(
            "SELECT id, file_url, file_name, file_size, mime_type, created_at \
             FROM entry_attachments \
             WHERE comment_id = ? AND deleted_at IS NULL \
             ORDER BY created_at ASC"
        )
        .bind(comment_id)
        .fetch_all(pool)
        .await?;

        Ok(attachments
            .into_iter()
            .map(|row| CommentAttachment {
                id: row.get("id"),
                file_url: row.get("file_url"),
                file_name: row.get("file_name"),
                file_size: row.get("file_size"),
                mime_type: row.get("mime_type"),
                created_at: row.get("created_at"),
            })
            .collect())
    }

    /// Link attachments to a comment
    async fn link_attachments(
        pool: &DbPool,
        comment_id: &str,
        attachment_ids: &[String],
    ) -> Result<(), AppError> {
        for attachment_id in attachment_ids {
            sqlx::query(
                "UPDATE entry_attachments \
                 SET comment_id = ? \
                 WHERE id = ? AND comment_id IS NULL"
            )
            .bind(comment_id)
            .bind(attachment_id)
            .execute(pool)
            .await?;
        }
        Ok(())
    }

    /// Update comment count for an entry
    async fn update_comment_count(pool: &DbPool, entry_id: &str) -> Result<(), AppError> {
        sqlx::query(
            "UPDATE entries \
             SET comment_count = (SELECT COUNT(*) FROM entry_comments WHERE entry_id = ? AND deleted_at IS NULL) \
             WHERE id = ?"
        )
        .bind(entry_id)
        .bind(entry_id)
        .execute(pool)
        .await?;
        Ok(())
    }

    /// Verify user has access to comment (is member of budget)
    pub async fn verify_access(
        pool: &DbPool,
        comment_id: &str,
        user_id: &str,
    ) -> Result<(String, String), AppError> {
        let result = sqlx::query(
            "SELECT e.id as entry_id, e.budget_id \
             FROM entry_comments c \
             INNER JOIN entries e ON c.entry_id = e.id \
             INNER JOIN budget_members bm ON e.budget_id = bm.budget_id \
             WHERE c.id = ? AND bm.user_id = ? AND c.deleted_at IS NULL"
        )
        .bind(comment_id)
        .bind(user_id)
        .fetch_optional(pool)
        .await?;

        match result {
            Some(row) => Ok((row.get("entry_id"), row.get("budget_id"))),
            None => Err(AppError::Forbidden),
        }
    }
}
