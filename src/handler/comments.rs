use std::sync::Arc;
use axum::{extract::{Path, State}, Json, Extension};
use serde::Serialize;

use crate::manager::models::comment::{
    CommentWithDetails, CreateCommentReq, UpdateCommentReq, 
    UploadAttachmentReq, UploadAttachmentResp,
};
use crate::manager::biz::comments::CommentService;
use crate::utils::error::error::AppError;
use super::{AppState, auth::Claims};

#[derive(Serialize)]
pub struct DeleteResp {
    pub message: String,
}

// ============ Comment Endpoints ============

/// GET /api/budgets/:budget_id/entries/:entry_id/comments
/// List all comments for an entry
pub async fn list_comments(
    State(state): State<Arc<AppState>>,
    Extension(claims): Extension<Claims>,
    Path((budget_id, entry_id)): Path<(String, String)>,
) -> Result<Json<Vec<CommentWithDetails>>, AppError> {
    // Ensure user has at least viewer access
    crate::manager::biz::authz::ensure_role(
        &state.pool,
        &budget_id,
        &claims.sub,
        crate::manager::models::role::Role::Viewer,
    )
    .await?;

    let comments = CommentService::list_by_entry(
        &state.pool,
        &entry_id,
        &claims.sub,
        &budget_id,
    )
    .await?;

    Ok(Json(comments))
}

/// POST /api/budgets/:budget_id/entries/:entry_id/comments
/// Create a new comment
pub async fn create_comment(
    State(state): State<Arc<AppState>>,
    Extension(claims): Extension<Claims>,
    Path((budget_id, entry_id)): Path<(String, String)>,
    Json(req): Json<CreateCommentReq>,
) -> Result<Json<CommentWithDetails>, AppError> {
    // Ensure user has at least contributor access
    crate::manager::biz::authz::ensure_role(
        &state.pool,
        &budget_id,
        &claims.sub,
        crate::manager::models::role::Role::Contributor,
    )
    .await?;

    let comment = CommentService::create(
        &state.pool,
        &entry_id,
        &budget_id,
        &claims.sub,
        req,
    )
    .await?;

    Ok(Json(comment))
}

/// PUT /api/budgets/:budget_id/entries/:entry_id/comments/:comment_id
/// Update a comment (only by comment author)
pub async fn update_comment(
    State(state): State<Arc<AppState>>,
    Extension(claims): Extension<Claims>,
    Path((budget_id, _entry_id, comment_id)): Path<(String, String, String)>,
    Json(req): Json<UpdateCommentReq>,
) -> Result<Json<CommentWithDetails>, AppError> {
    // Ensure user has at least contributor access
    crate::manager::biz::authz::ensure_role(
        &state.pool,
        &budget_id,
        &claims.sub,
        crate::manager::models::role::Role::Contributor,
    )
    .await?;

    let comment = CommentService::update(
        &state.pool,
        &comment_id,
        &claims.sub,
        req,
    )
    .await?;

    Ok(Json(comment))
}

/// DELETE /api/budgets/:budget_id/entries/:entry_id/comments/:comment_id
/// Delete a comment (only by comment author or budget admin)
pub async fn delete_comment(
    State(state): State<Arc<AppState>>,
    Extension(claims): Extension<Claims>,
    Path((budget_id, _entry_id, comment_id)): Path<(String, String, String)>,
) -> Result<Json<DeleteResp>, AppError> {
    // Ensure user has at least contributor access
    crate::manager::biz::authz::ensure_role(
        &state.pool,
        &budget_id,
        &claims.sub,
        crate::manager::models::role::Role::Contributor,
    )
    .await?;

    CommentService::delete(&state.pool, &comment_id, &claims.sub).await?;

    Ok(Json(DeleteResp {
        message: "Comment deleted successfully".to_string(),
    }))
}

// ============ Attachment Endpoints ============

/// POST /api/budgets/:budget_id/entries/:entry_id/attachments
/// Upload an attachment for an entry
pub async fn upload_attachment(
    State(state): State<Arc<AppState>>,
    Extension(claims): Extension<Claims>,
    Path((budget_id, entry_id)): Path<(String, String)>,
    Json(req): Json<UploadAttachmentReq>,
) -> Result<Json<UploadAttachmentResp>, AppError> {
    // Ensure user has at least contributor access
    crate::manager::biz::authz::ensure_role(
        &state.pool,
        &budget_id,
        &claims.sub,
        crate::manager::models::role::Role::Contributor,
    )
    .await?;

    let attachment = CommentService::upload_attachment(
        &state.pool,
        &entry_id,
        &budget_id,
        &claims.sub,
        req,
    )
    .await?;

    Ok(Json(attachment))
}

/// DELETE /api/budgets/:budget_id/entries/:entry_id/attachments/:attachment_id
/// Delete an attachment (only by attachment uploader or budget admin)
pub async fn delete_attachment(
    State(state): State<Arc<AppState>>,
    Extension(claims): Extension<Claims>,
    Path((budget_id, _entry_id, attachment_id)): Path<(String, String, String)>,
) -> Result<Json<DeleteResp>, AppError> {
    // Ensure user has at least contributor access
    crate::manager::biz::authz::ensure_role(
        &state.pool,
        &budget_id,
        &claims.sub,
        crate::manager::models::role::Role::Contributor,
    )
    .await?;

    CommentService::delete_attachment(&state.pool, &attachment_id, &claims.sub).await?;

    Ok(Json(DeleteResp {
        message: "Attachment deleted successfully".to_string(),
    }))
}
