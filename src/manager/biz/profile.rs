use sqlx::MySqlPool;

use crate::manager::models::user::{UpdateProfileReq, User};
use crate::manager::repository::users::UserRepo;
use crate::utils::error::error::AppError;
use crate::utils::image_processor::ImageProcessor;

pub struct ProfileService;

impl ProfileService {
    pub async fn get_profile(pool: &MySqlPool, user_id: &str) -> Result<User, AppError> {
        UserRepo::get_by_id(pool, user_id).await
    }

    pub async fn update_profile(
        pool: &MySqlPool,
        user_id: &str,
        req: UpdateProfileReq,
    ) -> Result<User, AppError> {
        // Get current user
        let mut user = UserRepo::get_by_id(pool, user_id).await?;

        // Update fields if provided
        if let Some(name) = req.name {
            user.name = Some(name);
        }
        if let Some(bio) = req.bio {
            user.bio = Some(bio);
        }
        if let Some(timezone) = req.timezone {
            user.timezone = timezone;
        }
        if let Some(locale) = req.locale {
            user.locale = locale;
        }

        user.updated_at = chrono::Utc::now().naive_utc();

        // Update in database
        UserRepo::update(pool, &user).await?;

        Ok(user)
    }

    pub async fn upload_avatar(
        pool: &MySqlPool,
        user_id: &str,
        base64_image: String,
    ) -> Result<String, AppError> {
        // Process image to bytes for S3 upload
        let image_bytes = ImageProcessor::process_avatar(&base64_image)?;

        // Upload to S3
        let s3_client = crate::utils::s3_storage::get_s3_client()?;
        let avatar_url = s3_client
            .upload_avatar(user_id, image_bytes, "image/webp")
            .await?;

        // Update database with S3 URL (not base64)
        UserRepo::update_avatar(pool, user_id, &avatar_url).await?;

        Ok(avatar_url)
    }

    pub async fn delete_avatar(pool: &MySqlPool, user_id: &str) -> Result<(), AppError> {
        // Delete from S3
        let s3_client = crate::utils::s3_storage::get_s3_client()?;
        s3_client.delete_avatar(user_id).await?;

        // Update database (set avatar to NULL)
        UserRepo::update_avatar(pool, user_id, "").await?;
        
        Ok(())
    }
}
