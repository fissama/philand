use base64::{engine::general_purpose, Engine as _};
use image::{imageops::FilterType, ImageFormat};
use std::io::Cursor;

use crate::utils::error::error::AppError;

pub struct ProcessedImage {
    pub data: Vec<u8>,
    pub size: usize,
}

pub struct ImageProcessor;

impl ImageProcessor {
    pub fn new() -> Self {
        Self
    }
}

impl ImageProcessor {
    /// Process avatar image: decode, resize, compress, and return bytes
    pub fn process_avatar(base64_image: &str) -> Result<Vec<u8>, AppError> {
        // Remove data URL prefix if present
        let base64_data = if base64_image.contains("base64,") {
            base64_image.split("base64,").nth(1).unwrap_or(base64_image)
        } else {
            base64_image
        };

        // Decode base64
        let image_data = general_purpose::STANDARD
            .decode(base64_data)
            .map_err(|_| AppError::BadRequest("Invalid base64 image data".to_string()))?;

        // Load image
        let img = image::load_from_memory(&image_data)
            .map_err(|_| AppError::BadRequest("Invalid image format".to_string()))?;

        // Resize to 200x200 (avatar size)
        let resized = img.resize_exact(200, 200, FilterType::Lanczos3);

        // Convert to WebP format with compression
        let mut buffer = Vec::new();
        let mut cursor = Cursor::new(&mut buffer);
        
        resized
            .write_to(&mut cursor, ImageFormat::WebP)
            .map_err(|_| AppError::Internal)?;

        // Check size and compress more if needed
        if buffer.len() > 51200 {
            // If > 50KB, try with lower quality
            buffer.clear();
            cursor = Cursor::new(&mut buffer);
            
            // Use JPEG with quality 80 as fallback
            resized
                .write_to(&mut cursor, ImageFormat::Jpeg)
                .map_err(|_| AppError::Internal)?;
        }

        Ok(buffer)
    }
    
    /// Process avatar and return base64 (for backward compatibility)
    #[allow(dead_code)]
    pub fn process_avatar_base64(base64_image: &str) -> Result<String, AppError> {
        let buffer = Self::process_avatar(base64_image)?;
        Ok(general_purpose::STANDARD.encode(&buffer))
    }

    /// Validate image size (max 5MB)
    pub fn validate_size(base64_image: &str) -> Result<(), AppError> {
        let base64_data = if base64_image.contains("base64,") {
            base64_image.split("base64,").nth(1).unwrap_or(base64_image)
        } else {
            base64_image
        };

        // Approximate size (base64 is ~33% larger than binary)
        let approx_size = (base64_data.len() * 3) / 4;
        
        if approx_size > 5_242_880 {
            // 5MB
            return Err(AppError::BadRequest(
                "Image size exceeds 5MB limit".to_string(),
            ));
        }

        Ok(())
    }

    /// Process comment attachment image: resize to max 1200px width, compress
    pub fn process_comment_image(&self, image_data: &[u8]) -> Result<ProcessedImage, AppError> {
        // Load image
        let img = image::load_from_memory(image_data)
            .map_err(|_| AppError::BadRequest("Invalid image format".to_string()))?;

        // Get dimensions
        let width = img.width();
        let height = img.height();
        
        // Resize if width > 1200px (maintain aspect ratio)
        let resized = if width > 1200 {
            let new_height = (1200 * height) / width;
            img.resize(1200, new_height, FilterType::Lanczos3)
        } else {
            img
        };

        // Convert to WebP format with compression
        let mut buffer = Vec::new();
        let mut cursor = Cursor::new(&mut buffer);
        
        resized
            .write_to(&mut cursor, ImageFormat::WebP)
            .map_err(|_| AppError::Internal)?;

        Ok(ProcessedImage {
            size: buffer.len(),
            data: buffer,
        })
    }
}
