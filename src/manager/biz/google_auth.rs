use crate::manager::models::google_auth::{GoogleTokenResponse, GoogleUserInfo};
use crate::manager::models::user::User;
use crate::utils::{database::database::DbPool, error::error::AppError};
use crate::config::config::get_config;

pub struct GoogleAuthService;

impl GoogleAuthService {
    pub async fn exchange_code_for_token(code: &str) -> Result<GoogleTokenResponse, AppError> {
        let client_id = get_config().get_google_cfg().get_client_id();
        let client_secret = get_config().get_google_cfg().get_client_secret();
        let redirect_uri = get_config().get_google_cfg().get_redirect_uri();

        tracing::info!("Exchanging Google auth code for token");
        tracing::debug!("Redirect URI: {}", redirect_uri);

        let params = [
            ("code", code),
            ("client_id", &client_id),
            ("client_secret", &client_secret),
            ("redirect_uri", &redirect_uri),
            ("grant_type", "authorization_code"),
        ];

        let client = reqwest::Client::new();
        let response = client
            .post("https://oauth2.googleapis.com/token")
            .form(&params)
            .send()
            .await
            .map_err(|e| {
                tracing::error!("Failed to send token exchange request: {}", e);
                AppError::Internal
            })?;

        let status = response.status();
        if !status.is_success() {
            let error_text = response.text().await.unwrap_or_default();
            tracing::error!("Google token exchange failed with status {}: {}", status, error_text);
            
            // Parse Google error response for better error messages
            if error_text.contains("redirect_uri_mismatch") {
                return Err(AppError::BadRequest("OAuth configuration error: redirect_uri_mismatch".to_string()));
            } else if error_text.contains("invalid_grant") {
                return Err(AppError::BadRequest("Authentication code expired or invalid. Please try again.".to_string()));
            } else if error_text.contains("invalid_client") {
                return Err(AppError::BadRequest("OAuth client configuration error".to_string()));
            }
            
            return Err(AppError::BadRequest(format!("Google authentication failed: {}", error_text)));
        }

        let token_response: GoogleTokenResponse = response
            .json()
            .await
            .map_err(|e| {
                tracing::error!("Failed to parse Google token response: {}", e);
                AppError::Internal
            })?;

        tracing::info!("Successfully exchanged code for Google token");
        Ok(token_response)
    }

    pub async fn get_user_info(access_token: &str) -> Result<GoogleUserInfo, AppError> {
        tracing::info!("Fetching user info from Google");
        
        let client = reqwest::Client::new();
        let response = client
            .get("https://www.googleapis.com/oauth2/v2/userinfo")
            .bearer_auth(access_token)
            .send()
            .await
            .map_err(|e| {
                tracing::error!("Failed to fetch user info from Google: {}", e);
                AppError::Internal
            })?;

        let status = response.status();
        if !status.is_success() {
            let error_text = response.text().await.unwrap_or_default();
            tracing::error!("Google user info request failed with status {}: {}", status, error_text);
            return Err(AppError::Internal);
        }

        let user_info: GoogleUserInfo = response
            .json()
            .await
            .map_err(|e| {
                tracing::error!("Failed to parse Google user info: {}", e);
                AppError::Internal
            })?;

        tracing::info!("Successfully fetched user info for: {}", user_info.email);
        Ok(user_info)
    }

    pub async fn find_or_create_user(
        pool: &DbPool,
        google_user: GoogleUserInfo,
    ) -> Result<User, AppError> {
        tracing::info!("Finding or creating user for email: {}", google_user.email);
        
        // Check if user exists by email
        let existing_user = sqlx::query_as::<_, User>(
            "SELECT id, email, name, avatar, bio, timezone, locale, created_at, updated_at 
             FROM users WHERE email = ?"
        )
        .bind(&google_user.email)
        .fetch_optional(pool)
        .await
        .map_err(|e| {
            tracing::error!("Database error checking for existing user: {}", e);
            AppError::Db(e.to_string())
        })?;

        if let Some(user) = existing_user {
            tracing::info!("Found existing user: {}", user.id);
            
            // Update avatar if Google provides one and user doesn't have one
            if google_user.picture.is_some() && user.avatar.is_none() {
                tracing::info!("Updating user avatar from Google");
                sqlx::query(
                    "UPDATE users SET avatar = ?, updated_at = NOW() WHERE id = ?"
                )
                .bind(&google_user.picture)
                .bind(&user.id)
                .execute(pool)
                .await
                .map_err(|e| {
                    tracing::error!("Failed to update user avatar: {}", e);
                    AppError::Db(e.to_string())
                })?;
            }
            
            return Ok(user);
        }

        // Create new user
        tracing::info!("Creating new user for email: {}", google_user.email);
        let user_id = uuid::Uuid::new_v4().to_string();
        let locale = google_user.locale.unwrap_or_else(|| "en".to_string());
        
        sqlx::query(
            "INSERT INTO users (id, email, name, avatar, timezone, locale, password_hash, created_at, updated_at) 
             VALUES (?, ?, ?, ?, 'UTC', ?, '', NOW(), NOW())"
        )
        .bind(&user_id)
        .bind(&google_user.email)
        .bind(&google_user.name)
        .bind(&google_user.picture)
        .bind(&locale)
        .execute(pool)
        .await
        .map_err(|e| {
            tracing::error!("Failed to create new user: {}", e);
            AppError::Db(e.to_string())
        })?;

        let user = sqlx::query_as::<_, User>(
            "SELECT id, email, name, avatar, bio, timezone, locale, created_at, updated_at 
             FROM users WHERE id = ?"
        )
        .bind(&user_id)
        .fetch_one(pool)
        .await
        .map_err(|e| {
            tracing::error!("Failed to fetch newly created user: {}", e);
            AppError::Db(e.to_string())
        })?;

        tracing::info!("Successfully created user: {}", user.id);
        Ok(user)
    }
}