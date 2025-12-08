use aws_config::BehaviorVersion;
use aws_sdk_s3::{
    config::{Credentials, Region},
    primitives::ByteStream,
    Client,
};
use bytes::Bytes;

use crate::config::config::get_config;
use crate::utils::error::error::AppError;

pub struct S3Storage {
    client: Client,
    bucket: String,
    public_url: String,
}

impl S3Storage {
    /// Initialize S3 client with configuration from config module
    pub async fn new() -> Result<Self, AppError> {
        let s3_config = get_config().get_s3_config();
        
        let access_key = s3_config.get_access_key();
        let secret_key = s3_config.get_secret_key();
        let bucket = s3_config.get_bucket();
        let endpoint = s3_config.get_endpoint();
        let region = s3_config.get_region();
        let public_url = s3_config.get_public_url();

        // Validate required credentials
        if access_key.is_empty() || secret_key.is_empty() {
            tracing::error!("S3 credentials not configured. Set S3_ACCESS_KEY and S3_SECRET_KEY in .env");
            return Err(AppError::Internal);
        }

        let credentials = Credentials::new(
            access_key,
            secret_key,
            None,
            None,
            "tebi-credentials",
        );

        let config = aws_config::defaults(BehaviorVersion::latest())
            .region(Region::new(region))
            .credentials_provider(credentials)
            .endpoint_url(endpoint)
            .load()
            .await;

        let client = Client::new(&config);

        Ok(Self {
            client,
            bucket,
            public_url,
        })
    }

    /// Upload image to S3 and return public URL
    pub async fn upload_avatar(
        &self,
        user_id: &str,
        image_data: Vec<u8>,
        content_type: &str,
    ) -> Result<String, AppError> {
        let key = format!("avatars/{}.webp", user_id);
        
        self.client
            .put_object()
            .bucket(&self.bucket)
            .key(&key)
            .body(ByteStream::from(Bytes::from(image_data)))
            .content_type(content_type)
            .acl(aws_sdk_s3::types::ObjectCannedAcl::PublicRead)
            .send()
            .await
            .map_err(|e| {
                tracing::error!("S3 upload failed: {}", e);
                AppError::Internal
            })?;

        Ok(format!("{}/{}", self.public_url, key))
    }

    /// Delete avatar from S3
    pub async fn delete_avatar(&self, user_id: &str) -> Result<(), AppError> {
        let key = format!("avatars/{}.webp", user_id);
        
        self.client
            .delete_object()
            .bucket(&self.bucket)
            .key(&key)
            .send()
            .await
            .map_err(|e| {
                tracing::error!("S3 delete failed: {}", e);
                AppError::Internal
            })?;

        Ok(())
    }

    /// Check if avatar exists in S3
    pub async fn avatar_exists(&self, user_id: &str) -> bool {
        let key = format!("avatars/{}.webp", user_id);
        
        self.client
            .head_object()
            .bucket(&self.bucket)
            .key(&key)
            .send()
            .await
            .is_ok()
    }

    /// Get avatar URL (doesn't check if exists)
    pub fn get_avatar_url(&self, user_id: &str) -> String {
        format!("{}/avatars/{}.webp", self.public_url, user_id)
    }

    /// Upload comment attachment to S3 and return public URL
    pub async fn upload_comment_attachment(
        &self,
        entry_id: &str,
        attachment_id: &str,
        image_data: Vec<u8>,
        content_type: &str,
        extension: &str,
    ) -> Result<String, AppError> {
        let key = format!("attachments/{}/{}.{}", entry_id, attachment_id, extension);
        
        self.client
            .put_object()
            .bucket(&self.bucket)
            .key(&key)
            .body(ByteStream::from(Bytes::from(image_data)))
            .content_type(content_type)
            .acl(aws_sdk_s3::types::ObjectCannedAcl::PublicRead)
            .send()
            .await
            .map_err(|e| {
                tracing::error!("S3 attachment upload failed: {}", e);
                AppError::Internal
            })?;

        Ok(format!("{}/{}", self.public_url, key))
    }

    /// Delete attachment from S3
    pub async fn delete_attachment(&self, file_url: &str) -> Result<(), AppError> {
        // Extract key from URL
        let key = file_url
            .strip_prefix(&format!("{}/", self.public_url))
            .ok_or_else(|| {
                tracing::error!("Invalid file URL format: {}", file_url);
                AppError::BadRequest("Invalid file URL format".to_string())
            })?;
        
        self.client
            .delete_object()
            .bucket(&self.bucket)
            .key(key)
            .send()
            .await
            .map_err(|e| {
                tracing::error!("S3 delete attachment failed: {}", e);
                AppError::Internal
            })?;

        Ok(())
    }
}

// Global S3 client instance
static mut S3_CLIENT: Option<S3Storage> = None;

/// Initialize global S3 client
pub async fn init_s3_client() -> Result<(), AppError> {
    let client = S3Storage::new().await?;
    unsafe {
        S3_CLIENT = Some(client);
    }
    Ok(())
}

/// Get global S3 client
pub fn get_s3_client() -> Result<&'static S3Storage, AppError> {
    unsafe {
        S3_CLIENT
            .as_ref()
            .ok_or(AppError::Internal)
    }
}
