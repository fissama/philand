use crate::manager::{models::category::{Category, CreateCategoryReq, UpdateCategoryReq}};
use crate::utils::{database::database::DbPool, error::error::AppError};
use crate::manager::{repository::categories::CategoryRepo};
pub struct CategoryService;

impl CategoryService {
    pub async fn list(pool: &DbPool, budget_id: &str, kind: Option<String>) -> Result<Vec<Category>, AppError> {
        CategoryRepo::list(pool, budget_id, kind).await
    }
    
    pub async fn create(pool: &DbPool, budget_id: &str, req: CreateCategoryReq) -> Result<Category, AppError> {
        // Validate color format if provided
        if let Some(color) = &req.color {
            if !Self::is_valid_color(color) {
                return Err(AppError::BadRequest("Invalid color format. Use hex format like #FF5733".to_string()));
            }
        }
        
        CategoryRepo::create(pool, budget_id, req).await
    }
    
    pub async fn update(pool: &DbPool, budget_id: &str, category_id: &str, req: UpdateCategoryReq) -> Result<Category, AppError> {
        // Validate color format if provided
        if let Some(color) = &req.color {
            if !Self::is_valid_color(color) {
                return Err(AppError::BadRequest("Invalid color format. Use hex format like #FF5733".to_string()));
            }
        }
        
        CategoryRepo::update(pool, budget_id, category_id, req).await
    }
    
    pub async fn delete(pool: &DbPool, budget_id: &str, category_id: &str) -> Result<(), AppError> {
        // Check if category is being used by any entries
        let entry_count = sqlx::query_scalar::<_, i64>("SELECT COUNT(*) FROM entries WHERE category_id = ?")
            .bind(category_id)
            .fetch_one(pool)
            .await?;
            
        if entry_count > 0 {
            return Err(AppError::BadRequest(format!("Cannot delete category. It is used by {} entries.", entry_count)));
        }
        
        CategoryRepo::delete(pool, budget_id, category_id).await
    }
    
    pub async fn get_by_id(pool: &DbPool, budget_id: &str, category_id: &str) -> Result<Category, AppError> {
        CategoryRepo::get_by_id(pool, budget_id, category_id).await
    }
    
    fn is_valid_color(color: &str) -> bool {
        // Check if it's a valid hex color (e.g., #FF5733 or #f57)
        if !color.starts_with('#') {
            return false;
        }
        
        let hex_part = &color[1..];
        if hex_part.len() != 3 && hex_part.len() != 6 {
            return false;
        }
        
        hex_part.chars().all(|c| c.is_ascii_hexdigit())
    }
}
