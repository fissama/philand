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
        // Process and compress the image
        let processed_avatar = ImageProcessor::process_avatar(&base64_image)?;

        // Update user avatar in database
        UserRepo::update_avatar(pool, user_id, &processed_avatar).await?;

        Ok(processed_avatar)
    }

    pub async fn delete_avatar(pool: &MySqlPool, user_id: &str) -> Result<(), AppError> {
        UserRepo::update_avatar(pool, user_id, "").await?;
        Ok(())
    }
}
