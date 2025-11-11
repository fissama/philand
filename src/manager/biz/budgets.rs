use crate::manager::{models::budget::{Budget, CreateBudgetReq}};
use crate::utils::{database::database::DbPool, error::error::AppError};
use crate::manager::{repository::budgets::BudgetRepo};

pub struct BudgetService;

impl BudgetService {
    pub async fn list(pool: &DbPool, owner_id: Option<String>) -> Result<Vec<Budget>, AppError> {
        BudgetRepo::list(pool, owner_id).await
    }
    pub async fn get(pool: &DbPool, id: &str) -> Result<Budget, AppError> {
        BudgetRepo::get(pool, id).await
    }
    pub async fn create(pool: &DbPool, req: CreateBudgetReq) -> Result<Budget, AppError> {
        BudgetRepo::create(pool, req).await
    }
}
