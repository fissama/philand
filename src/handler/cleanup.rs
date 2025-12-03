use std::sync::Arc;
use axum::{extract::State, Json, Extension};
use serde::Serialize;
use crate::utils::error::error::AppError;
use crate::utils::cleanup::CleanupService;
use super::AppState;

#[derive(Serialize)]
pub struct CleanupResponse {
    pub message: String,
    pub entries_deleted: u64,
    pub cutoff_date: String,
}

/// Manual cleanup endpoint (admin only - requires authentication)
/// This endpoint allows administrators to manually trigger the cleanup process
pub async fn manual_cleanup(
    State(state): State<Arc<AppState>>,
    Extension(_claims): Extension<crate::handler::auth::Claims>,
) -> Result<Json<CleanupResponse>, AppError> {
    // Run cleanup for records older than 1 day
    let stats = CleanupService::cleanup_daily(&state.pool)
        .await
        .map_err(|e| {
            tracing::error!("Cleanup failed: {}", e);
            AppError::Internal
        })?;
    
    Ok(Json(CleanupResponse {
        message: "Cleanup completed successfully".to_string(),
        entries_deleted: stats.entries_deleted,
        cutoff_date: stats.cutoff_date.format("%Y-%m-%d %H:%M:%S").to_string(),
    }))
}
