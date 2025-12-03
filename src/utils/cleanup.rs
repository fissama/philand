use crate::utils::database::database::DbPool;
use chrono::{Duration, Utc};

pub struct CleanupService;

impl CleanupService {
    /// Permanently delete soft-deleted records older than the specified number of days
    /// Currently only entries table supports soft delete
    pub async fn cleanup_soft_deleted(pool: &DbPool, days: i64) -> Result<CleanupStats, sqlx::Error> {
        let cutoff_date = Utc::now().naive_utc() - Duration::days(days);
        
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
            cutoff_date,
        })
    }
    
    /// Run cleanup for records older than 1 day (default)
    pub async fn cleanup_daily(pool: &DbPool) -> Result<CleanupStats, sqlx::Error> {
        Self::cleanup_soft_deleted(pool, 1).await
    }
}

#[derive(Debug)]
pub struct CleanupStats {
    pub entries_deleted: u64,
    pub cutoff_date: chrono::NaiveDateTime,
}

impl std::fmt::Display for CleanupStats {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(
            f,
            "Cleanup completed: {} entries deleted (cutoff: {})",
            self.entries_deleted,
            self.cutoff_date.format("%Y-%m-%d %H:%M:%S")
        )
    }
}
