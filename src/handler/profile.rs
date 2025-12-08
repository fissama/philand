use axum::{extract::State, Extension, Json};
use serde::{Deserialize, Serialize};
use std::sync::Arc;

use crate::handler::auth::Claims;
use crate::handler::AppState;
use crate::manager::biz::profile::ProfileService;
use crate::manager::models::user::{UpdateProfileReq, User};
use crate::utils::error::error::AppError;

#[derive(Deserialize)]
pub struct UploadAvatarReq {
    pub avatar: String, // base64 encoded image
}

#[derive(Serialize)]
pub struct AvatarResponse {
    pub avatar_url: String,
    pub message: String,
}

pub async fn get_profile(
    State(state): State<Arc<AppState>>,
    Extension(claims): Extension<Claims>,
) -> Result<Json<User>, AppError> {
    let user = ProfileService::get_profile(&state.pool, &claims.sub).await?;
    Ok(Json(user))
}

pub async fn update_profile(
    State(state): State<Arc<AppState>>,
    Extension(claims): Extension<Claims>,
    Json(req): Json<UpdateProfileReq>,
) -> Result<Json<User>, AppError> {
    let user = ProfileService::update_profile(&state.pool, &claims.sub, req).await?;
    Ok(Json(user))
}

pub async fn upload_avatar(
    State(state): State<Arc<AppState>>,
    Extension(claims): Extension<Claims>,
    Json(req): Json<UploadAvatarReq>,
) -> Result<Json<AvatarResponse>, AppError> {
    // Validate avatar data is not empty
    if req.avatar.trim().is_empty() {
        return Err(AppError::BadRequest("Avatar data is required".to_string()));
    }
    
    // Validate size before processing
    use crate::utils::image_processor::ImageProcessor;
    ImageProcessor::validate_size(&req.avatar)?;
    
    // Upload to S3 and get URL
    let avatar_url = ProfileService::upload_avatar(&state.pool, &claims.sub, req.avatar).await?;
    
    Ok(Json(AvatarResponse {
        avatar_url, // Now returns S3 URL directly
        message: "Avatar uploaded successfully".to_string(),
    }))
}

pub async fn delete_avatar(
    State(state): State<Arc<AppState>>,
    Extension(claims): Extension<Claims>,
) -> Result<Json<AvatarResponse>, AppError> {
    ProfileService::delete_avatar(&state.pool, &claims.sub).await?;
    
    Ok(Json(AvatarResponse {
        avatar_url: String::new(),
        message: "Avatar deleted successfully".to_string(),
    }))
}
