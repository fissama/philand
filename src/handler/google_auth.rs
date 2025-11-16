use axum::{extract::State, Json};
use std::sync::Arc;
use jsonwebtoken::{encode, EncodingKey, Header, Algorithm};
use time::{Duration, OffsetDateTime};

use crate::handler::{AppState, auth::Claims};
use crate::manager::biz::google_auth::GoogleAuthService;
use crate::manager::models::google_auth::{GoogleAuthRequest, GoogleAuthResponse};
use crate::utils::error::error::AppError;
use crate::config::config::get_config;

pub async fn google_auth(
    State(state): State<Arc<AppState>>,
    Json(req): Json<GoogleAuthRequest>,
) -> Result<Json<GoogleAuthResponse>, AppError> {
    tracing::info!("Google auth request received");
    
    // Exchange authorization code for access token
    let token_response = GoogleAuthService::exchange_code_for_token(&req.code).await?;

    // Get user info from Google
    let google_user = GoogleAuthService::get_user_info(&token_response.access_token).await?;

    // Verify email is verified
    if !google_user.verified_email {
        tracing::warn!("Google auth failed: email not verified for {}", google_user.email);
        return Err(AppError::BadRequest("Email not verified with Google. Please verify your email first.".to_string()));
    }

    // Find or create user in database
    let user = GoogleAuthService::find_or_create_user(&state.pool, google_user).await?;

    // Generate JWT token
    tracing::info!("Generating JWT token for user: {}", user.id);
    let ttl_min: i64 = get_config().get_jwt_config().get_ttl_min();
    let exp = (OffsetDateTime::now_utc() + Duration::minutes(ttl_min)).unix_timestamp() as usize;
    let claims = Claims { sub: user.id.clone(), email: user.email.clone(), exp };
    let secret = get_config().get_jwt_config().get_secret();
    let encoding_key = EncodingKey::from_secret(secret.as_bytes());
    let token = encode(&Header::new(Algorithm::HS256), &claims, &encoding_key)
        .map_err(|e| {
            tracing::error!("Failed to generate JWT token: {}", e);
            AppError::Internal
        })?;

    tracing::info!("Google auth successful for user: {}", user.email);
    Ok(Json(GoogleAuthResponse { token, user }))
}