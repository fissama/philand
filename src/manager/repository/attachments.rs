use crate::manager::models::comment::{EntryAttachment, AttachmentWithUser};
use crate::utils::{database::database::DbPool, error::error::AppError};
use sqlx::Row;

pub struct AttachmentRepo;

impl AttachmentRepo {
    /// List all attachments for an entry
    pub async fn list_by_entry(
        pool: &DbPool,
        entry_id: &str,
    ) -> Result<Vec<AttachmentWithUser>, AppError> {
        let attachments = sqlx::query(
            "SELECT a.id, a.entry_id, a.comment_id, a.user_id, a.file_url, a.file_name, \
                    a.file_size, a.mime_type, a.created_at, \
                    u.name as user_name, u.avatar as user_avatar \
             FROM entry_attachments a \
             INNER JOIN users u ON a.user_id = u.id \
             WHERE a.entry_id = ? AND a.deleted_at IS NULL \
             ORDER BY a.created_at DESC"
        )
        .bind(entry_id)
        .fetch_all(pool)
        .await?;

        Ok(attachments
            .into_iter()
            .map(|row| AttachmentWithUser {
                id: row.get("id"),
                entry_id: row.get("entry_id"),
                comment_id: row.get("comment_id"),
                user_id: row.get("user_id"),
                user_name: row.get("user_name"),
                user_avatar: row.get("user_avatar"),
                file_url: row.get("file_url"),
                file_name: row.get("file_name"),
                file_size: row.get("file_size"),
                mime_type: row.get("mime_type"),
                created_at: row.get("created_at"),
            })
            .collect())
    }

    /// Create a new attachment (temporary, not linked to comment yet)
    pub async fn create(
        pool: &DbPool,
        attachment_id: &str,
        entry_id: &str,
        user_id: &str,
        file_url: String,
        file_name: String,
        file_size: i32,
        mime_type: String,
    ) -> Result<String, AppError> {
        sqlx::query(
            "INSERT INTO entry_attachments \
             (id, entry_id, user_id, file_url, file_name, file_size, mime_type) \
             VALUES (?, ?, ?, ?, ?, ?, ?)"
        )
        .bind(attachment_id)
        .bind(entry_id)
        .bind(user_id)
        .bind(&file_url)
        .bind(&file_name)
        .bind(file_size)
        .bind(&mime_type)
        .execute(pool)
        .await?;

        // Update attachment count
        Self::update_attachment_count(pool, entry_id).await?;

        Ok(attachment_id.to_string())
    }

    /// Delete an attachment (soft delete)
    pub async fn delete(
        pool: &DbPool,
        attachment_id: &str,
        user_id: &str,
    ) -> Result<(String, String), AppError> {
        // First, get the entry_id and file_url before deleting
        let fetch_result = sqlx::query(
            "SELECT entry_id, file_url FROM entry_attachments \
             WHERE id = ? AND user_id = ? AND deleted_at IS NULL"
        )
        .bind(attachment_id)
        .bind(user_id)
        .fetch_optional(pool)
        .await?;

        let (entry_id, file_url): (String, String) = match fetch_result {
            Some(row) => (row.get("entry_id"), row.get("file_url")),
            None => return Err(AppError::NotFound),
        };

        // Now perform the soft delete
        let result = sqlx::query(
            "UPDATE entry_attachments \
             SET deleted_at = CURRENT_TIMESTAMP \
             WHERE id = ? AND user_id = ? AND deleted_at IS NULL"
        )
        .bind(attachment_id)
        .bind(user_id)
        .execute(pool)
        .await?;

        if result.rows_affected() == 0 {
            return Err(AppError::NotFound);
        }

        Self::update_attachment_count(pool, &entry_id).await?;
        Ok((entry_id, file_url))
    }

    /// Get attachment by ID
    pub async fn get_by_id(
        pool: &DbPool,
        attachment_id: &str,
    ) -> Result<EntryAttachment, AppError> {
        sqlx::query_as::<_, EntryAttachment>(
            "SELECT * FROM entry_attachments WHERE id = ? AND deleted_at IS NULL"
        )
        .bind(attachment_id)
        .fetch_optional(pool)
        .await?
        .ok_or(AppError::NotFound)
    }

    /// Update attachment count for an entry
    async fn update_attachment_count(pool: &DbPool, entry_id: &str) -> Result<(), AppError> {
        sqlx::query(
            "UPDATE entries \
             SET attachment_count = (SELECT COUNT(*) FROM entry_attachments WHERE entry_id = ? AND deleted_at IS NULL) \
             WHERE id = ?"
        )
        .bind(entry_id)
        .bind(entry_id)
        .execute(pool)
        .await?;
        Ok(())
    }

    /// Verify user has access to attachment (is member of budget)
    pub async fn verify_access(
        pool: &DbPool,
        attachment_id: &str,
        user_id: &str,
    ) -> Result<(String, String), AppError> {
        let result = sqlx::query(
            "SELECT e.id as entry_id, e.budget_id \
             FROM entry_attachments a \
             INNER JOIN entries e ON a.entry_id = e.id \
             INNER JOIN budget_members bm ON e.budget_id = bm.budget_id \
             WHERE a.id = ? AND bm.user_id = ? AND a.deleted_at IS NULL"
        )
        .bind(attachment_id)
        .bind(user_id)
        .fetch_optional(pool)
        .await?;

        match result {
            Some(row) => Ok((row.get("entry_id"), row.get("budget_id"))),
            None => Err(AppError::Forbidden),
        }
    }

    /// Clean up orphaned attachments (not linked to any comment after timeout)
    pub async fn cleanup_orphaned(pool: &DbPool, hours: i32) -> Result<Vec<String>, AppError> {
        let orphaned = sqlx::query(
            "SELECT id, file_url FROM entry_attachments \
             WHERE comment_id IS NULL \
             AND created_at < DATE_SUB(NOW(), INTERVAL ? HOUR) \
             AND deleted_at IS NULL"
        )
        .bind(hours)
        .fetch_all(pool)
        .await?;

        let mut file_urls = Vec::new();
        for row in orphaned {
            let id: String = row.get("id");
            let file_url: String = row.get("file_url");
            
            sqlx::query("UPDATE entry_attachments SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?")
                .bind(&id)
                .execute(pool)
                .await?;
            
            file_urls.push(file_url);
        }

        Ok(file_urls)
    }
}
