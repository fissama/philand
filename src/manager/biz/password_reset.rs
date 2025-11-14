use sqlx::MySqlPool;
use uuid::Uuid;
use chrono::{Utc, Duration};
use rand::Rng;
use bcrypt::hash;

use crate::utils::error::error::AppError;

pub struct PasswordResetService;

impl PasswordResetService {
    /// Generate a secure reset token
    pub fn generate_token() -> String {
        Uuid::new_v4().to_string()
    }

    /// Generate a 6-digit OTP code
    pub fn generate_otp() -> String {
        let mut rng = rand::thread_rng();
        format!("{:06}", rng.gen_range(0..1000000))
    }

    /// Create email-based password reset request
    pub async fn create_email_reset(
        pool: &MySqlPool,
        email: &str,
        token_ttl_min: i64,
    ) -> Result<String, AppError> {
        // Find user by email
        let user_id: Option<String> = sqlx::query_scalar(
            "SELECT id FROM users WHERE email = ?"
        )
        .bind(email)
        .fetch_optional(pool)
        .await?;

        let user_id = user_id.ok_or(AppError::NotFound)?;

        // Generate token
        let token = Self::generate_token();
        let expires_at = Utc::now() + Duration::minutes(token_ttl_min);

        // Insert reset request
        sqlx::query(
            "INSERT INTO password_resets (id, user_id, reset_type, token, expires_at, used) 
             VALUES (?, ?, 'email', ?, ?, FALSE)"
        )
        .bind(Uuid::new_v4().to_string())
        .bind(&user_id)
        .bind(&token)
        .bind(expires_at)
        .execute(pool)
        .await?;

        Ok(token)
    }

    /// Create OTP-based password reset request
    pub async fn create_otp_reset(
        pool: &MySqlPool,
        email: &str,
        otp_ttl_min: i64,
    ) -> Result<String, AppError> {
        // Find user by email
        let user_id: Option<String> = sqlx::query_scalar(
            "SELECT id FROM users WHERE email = ?"
        )
        .bind(email)
        .fetch_optional(pool)
        .await?;

        let user_id = user_id.ok_or(AppError::NotFound)?;

        // Generate OTP
        let otp = Self::generate_otp();
        let expires_at = Utc::now() + Duration::minutes(otp_ttl_min);

        // Insert reset request
        sqlx::query(
            "INSERT INTO password_resets (id, user_id, reset_type, otp_code, expires_at, used) 
             VALUES (?, ?, 'otp', ?, ?, FALSE)"
        )
        .bind(Uuid::new_v4().to_string())
        .bind(&user_id)
        .bind(&otp)
        .bind(expires_at)
        .execute(pool)
        .await?;

        Ok(otp)
    }

    /// Validate and consume reset token
    async fn validate_token(
        pool: &MySqlPool,
        token: &str,
    ) -> Result<String, AppError> {
        let result: Option<(String, String, bool, chrono::DateTime<Utc>)> = sqlx::query_as(
            "SELECT id, user_id, used, expires_at FROM password_resets 
             WHERE token = ? AND reset_type = 'email'"
        )
        .bind(token)
        .fetch_optional(pool)
        .await?;

        let (reset_id, user_id, used, expires_at) = result.ok_or(AppError::Unauthorized)?;

        // Check if already used
        if used {
            return Err(AppError::BadRequest("Reset token already used".to_string()));
        }

        // Check if expired
        if Utc::now() > expires_at {
            return Err(AppError::BadRequest("Reset token expired".to_string()));
        }

        // Mark as used
        sqlx::query("UPDATE password_resets SET used = TRUE WHERE id = ?")
            .bind(&reset_id)
            .execute(pool)
            .await?;

        Ok(user_id)
    }

    /// Validate and consume OTP code
    async fn validate_otp(
        pool: &MySqlPool,
        email: &str,
        otp: &str,
    ) -> Result<String, AppError> {
        // Find user by email
        let user_id: Option<String> = sqlx::query_scalar(
            "SELECT id FROM users WHERE email = ?"
        )
        .bind(email)
        .fetch_optional(pool)
        .await?;

        let user_id = user_id.ok_or(AppError::NotFound)?;

        // Find valid OTP
        let result: Option<(String, bool, chrono::DateTime<Utc>)> = sqlx::query_as(
            "SELECT id, used, expires_at FROM password_resets 
             WHERE user_id = ? AND otp_code = ? AND reset_type = 'otp'"
        )
        .bind(&user_id)
        .bind(otp)
        .fetch_optional(pool)
        .await?;

        let (reset_id, used, expires_at) = result.ok_or(AppError::Unauthorized)?;

        // Check if already used
        if used {
            return Err(AppError::BadRequest("OTP already used".to_string()));
        }

        // Check if expired
        if Utc::now() > expires_at {
            return Err(AppError::BadRequest("OTP expired".to_string()));
        }

        // Mark as used
        sqlx::query("UPDATE password_resets SET used = TRUE WHERE id = ?")
            .bind(&reset_id)
            .execute(pool)
            .await?;

        Ok(user_id)
    }

    /// Reset password using token or OTP
    pub async fn reset_password(
        pool: &MySqlPool,
        token: Option<String>,
        email: Option<String>,
        otp: Option<String>,
        new_password: String,
        bcrypt_cost: u32,
    ) -> Result<(), AppError> {
        // Validate input
        let user_id = if let Some(token) = token {
            Self::validate_token(pool, &token).await?
        } else if let (Some(email), Some(otp)) = (email, otp) {
            Self::validate_otp(pool, &email, &otp).await?
        } else {
            return Err(AppError::BadRequest("Either token or (email + otp) required".to_string()));
        };

        // Hash new password
        let password_hash = hash(new_password, bcrypt_cost)
            .map_err(|_| AppError::Internal)?;

        // Update user password
        sqlx::query("UPDATE users SET password_hash = ? WHERE id = ?")
            .bind(&password_hash)
            .bind(&user_id)
            .execute(pool)
            .await?;

        Ok(())
    }

    /// Clean up expired reset requests
    pub async fn cleanup_expired(pool: &MySqlPool) -> Result<u64, AppError> {
        let result = sqlx::query(
            "DELETE FROM password_resets WHERE expires_at < NOW() OR used = TRUE"
        )
        .execute(pool)
        .await?;

        Ok(result.rows_affected())
    }
}
