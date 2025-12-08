use crate::manager::models::notification::{Notification, CreateNotificationReq};
use crate::utils::{database::database::DbPool, error::error::AppError};

pub struct NotificationRepo;

impl NotificationRepo {
    /// Create a new notification
    pub async fn create(
        pool: &DbPool,
        req: CreateNotificationReq,
    ) -> Result<String, AppError> {
        let notification_id = uuid::Uuid::new_v4().to_string();

        sqlx::query(
            "INSERT INTO notifications \
             (id, user_id, budget_id, notification_type, title, message, link_url, related_id) \
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
        )
        .bind(&notification_id)
        .bind(&req.user_id)
        .bind(&req.budget_id)
        .bind(&req.notification_type)
        .bind(&req.title)
        .bind(&req.message)
        .bind(&req.link_url)
        .bind(&req.related_id)
        .execute(pool)
        .await?;

        // Update unread count
        Self::update_unread_count(pool, &req.user_id).await?;

        Ok(notification_id)
    }

    /// List notifications for a user
    pub async fn list_by_user(
        pool: &DbPool,
        user_id: &str,
        limit: Option<u32>,
        unread_only: bool,
    ) -> Result<Vec<Notification>, AppError> {
        let limit = limit.unwrap_or(50).min(100);
        
        let mut query = String::from(
            "SELECT * FROM notifications WHERE user_id = ?"
        );
        
        if unread_only {
            query.push_str(" AND is_read = FALSE");
        }
        
        query.push_str(" ORDER BY created_at DESC LIMIT ?");

        let notifications = sqlx::query_as::<_, Notification>(&query)
            .bind(user_id)
            .bind(limit)
            .fetch_all(pool)
            .await?;

        Ok(notifications)
    }

    /// Mark notifications as read
    pub async fn mark_as_read(
        pool: &DbPool,
        notification_ids: &[String],
        user_id: &str,
    ) -> Result<(), AppError> {
        if notification_ids.is_empty() {
            return Ok(());
        }

        let placeholders = notification_ids.iter().map(|_| "?").collect::<Vec<_>>().join(",");
        let query = format!(
            "UPDATE notifications SET is_read = TRUE, read_at = CURRENT_TIMESTAMP \
             WHERE id IN ({}) AND user_id = ?",
            placeholders
        );

        let mut q = sqlx::query(&query);
        for id in notification_ids {
            q = q.bind(id);
        }
        q = q.bind(user_id);
        
        q.execute(pool).await?;

        // Update unread count
        Self::update_unread_count(pool, user_id).await?;

        Ok(())
    }

    /// Mark all notifications as read for a user
    pub async fn mark_all_as_read(
        pool: &DbPool,
        user_id: &str,
    ) -> Result<(), AppError> {
        sqlx::query(
            "UPDATE notifications SET is_read = TRUE, read_at = CURRENT_TIMESTAMP \
             WHERE user_id = ? AND is_read = FALSE"
        )
        .bind(user_id)
        .execute(pool)
        .await?;

        // Update unread count
        Self::update_unread_count(pool, user_id).await?;

        Ok(())
    }

    /// Get unread count for a user
    pub async fn get_unread_count(
        pool: &DbPool,
        user_id: &str,
    ) -> Result<i64, AppError> {
        let result = sqlx::query_scalar::<_, i64>(
            "SELECT COUNT(*) FROM notifications WHERE user_id = ? AND is_read = FALSE"
        )
        .bind(user_id)
        .fetch_one(pool)
        .await?;

        Ok(result)
    }

    /// Update unread notification count in users table
    async fn update_unread_count(
        pool: &DbPool,
        user_id: &str,
    ) -> Result<(), AppError> {
        sqlx::query(
            "UPDATE users SET unread_notification_count = \
             (SELECT COUNT(*) FROM notifications WHERE user_id = ? AND is_read = FALSE) \
             WHERE id = ?"
        )
        .bind(user_id)
        .bind(user_id)
        .execute(pool)
        .await?;

        Ok(())
    }

    /// Delete old read notifications (cleanup job)
    pub async fn cleanup_old_notifications(
        pool: &DbPool,
        days: i32,
    ) -> Result<u64, AppError> {
        let result = sqlx::query(
            "DELETE FROM notifications \
             WHERE is_read = TRUE AND read_at < DATE_SUB(NOW(), INTERVAL ? DAY)"
        )
        .bind(days)
        .execute(pool)
        .await?;

        Ok(result.rows_affected())
    }
}
