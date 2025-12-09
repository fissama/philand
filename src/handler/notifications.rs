use std::sync::Arc;
use axum::{extract::{State, Query}, Json, Extension};
use serde::{Deserialize, Serialize};

use crate::manager::models::notification::Notification;
use crate::manager::repository::notifications::NotificationRepo;
use crate::utils::error::error::AppError;
use super::{AppState, auth::Claims};

#[derive(Deserialize)]
pub struct ListNotificationsQuery {
    pub limit: Option<u32>,
    pub unread_only: Option<bool>,
}

#[derive(Deserialize)]
pub struct MarkReadReq {
    pub notification_ids: Vec<String>,
}

#[derive(Serialize)]
pub struct UnreadCountResp {
    pub count: i64,
}

#[derive(Serialize)]
pub struct MessageResp {
    pub message: String,
}

/// GET /api/notifications
/// List notifications for the current user
pub async fn list_notifications(
    State(state): State<Arc<AppState>>,
    Extension(claims): Extension<Claims>,
    Query(query): Query<ListNotificationsQuery>,
) -> Result<Json<Vec<Notification>>, AppError> {
    let notifications = NotificationRepo::list_by_user(
        &state.pool,
        &claims.sub,
        query.limit,
        query.unread_only.unwrap_or(false),
    )
    .await?;

    Ok(Json(notifications))
}

/// GET /api/notifications/unread-count
/// Get unread notification count for the current user
pub async fn get_unread_count(
    State(state): State<Arc<AppState>>,
    Extension(claims): Extension<Claims>,
) -> Result<Json<UnreadCountResp>, AppError> {
    let count = NotificationRepo::get_unread_count(&state.pool, &claims.sub).await?;

    Ok(Json(UnreadCountResp { count }))
}

/// POST /api/notifications/mark-read
/// Mark specific notifications as read
pub async fn mark_as_read(
    State(state): State<Arc<AppState>>,
    Extension(claims): Extension<Claims>,
    Json(req): Json<MarkReadReq>,
) -> Result<Json<MessageResp>, AppError> {
    NotificationRepo::mark_as_read(&state.pool, &req.notification_ids, &claims.sub).await?;

    Ok(Json(MessageResp {
        message: "Notifications marked as read".to_string(),
    }))
}

/// POST /api/notifications/mark-all-read
/// Mark all notifications as read for the current user
pub async fn mark_all_as_read(
    State(state): State<Arc<AppState>>,
    Extension(claims): Extension<Claims>,
) -> Result<Json<MessageResp>, AppError> {
    NotificationRepo::mark_all_as_read(&state.pool, &claims.sub).await?;

    Ok(Json(MessageResp {
        message: "All notifications marked as read".to_string(),
    }))
}
