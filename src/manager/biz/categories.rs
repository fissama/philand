use crate::manager::{models::category::{Category, CreateCategoryReq}};
use crate::utils::{database::database::DbPool, error::error::AppError};
use crate::manager::{repository::categories::CategoryRepo};
pub struct CategoryService;

impl CategoryService {
    pub async fn list(pool: &DbPool, budget_id: &str, kind: Option<String>) -> Result<Vec<Category>, AppError> {
        CategoryRepo::list(pool, budget_id, kind).await
    }
    pub async fn create(pool: &DbPool, budget_id: &str, req: CreateCategoryReq) -> Result<Category, AppError> {
        CategoryRepo::create(pool, budget_id, req).await
    }
}
