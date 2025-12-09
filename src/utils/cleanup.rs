use crate::utils::database::database::DbPool;
use crate::manager::repository::notifications::NotificationRepo;
use chrono::Duration;

pub struct CleanupService;

impl CleanupService {
    pub async fn cleanup_soft_deleted(pool: &DbPool, days: i64) -> Result<CleanupStats, sqlx::Error> {
        let cutoff_date = chrono::Utc::now().naive_utc() - Duration::days(days);
        
        // Delete entries that were soft-deleted more than 'days' ago
        let entries_deleted = sqlx::query(
            "DELETE FROM entries WHERE deleted_at IS NOT NULL AND deleted_at < ?"
        )
        .bind(cutoff_date)
        .execute(pool)
        .await?
        .rows_affected();
        
        Ok(CleanupStats {
            entries_deleted,
            notifications_deleted: 0,
            cutoff_date,
        })
    }
    
    /// Delete old read notifications that have been read for more than specified days
    pub async fn cleanup_old_notifications(pool: &DbPool, days: i32) -> Result<u64, sqlx::Error> {
        match NotificationRepo::cleanup_old_notifications(pool, days).await {
            Ok(count) => Ok(count),
            Err(e) => {
                tracing::error!("Failed to cleanup notifications: {:?}", e);
                Ok(0)
            }
        }
    }
    
    /// Run daily cleanup job
    /// - Deletes soft-deleted entries older than 1 day
    /// - Deletes read notifications that have been read for more than 7 days (unread notifications are kept)
    pub async fn cleanup_daily(pool: &DbPool) -> Result<CleanupStats, sqlx::Error> {
        let mut stats = Self::cleanup_soft_deleted(pool, 1).await?;
        
        // Delete read notifications that have been read for more than 7 days
        stats.notifications_deleted = Self::cleanup_old_notifications(pool, 7).await?;
        
        Ok(stats)
    }
}

#[derive(Debug)]
pub struct CleanupStats {
    pub entries_deleted: u64,
    pub notifications_deleted: u64,
    pub cutoff_date: chrono::NaiveDateTime,
}

impl std::fmt::Display for CleanupStats {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(
            f,
            "Cleanup completed: {} entries deleted, {} notifications deleted (cutoff: {})",
            self.entries_deleted,
            self.notifications_deleted,
            self.cutoff_date.format("%Y-%m-%d %H:%M:%S")
        )
    }
}
