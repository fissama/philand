use crate::manager::{models::budget::{Budget, CreateBudgetReq}};
use crate::handler::budgets::UpdateBudgetReq;
use crate::utils::{database::database::DbPool, error::error::AppError};
use crate::manager::{repository::budgets::BudgetRepo};

pub struct BudgetService;

impl BudgetService {
    pub async fn list(pool: &DbPool, owner_id: Option<String>, query: Option<String>) -> Result<Vec<Budget>, AppError> {
        BudgetRepo::list(pool, owner_id, query).await
    }
    
    pub async fn get(pool: &DbPool, id: &str) -> Result<Budget, AppError> {
        BudgetRepo::get(pool, id).await
    }
    
    pub async fn create(pool: &DbPool, req: CreateBudgetReq) -> Result<Budget, AppError> {
        BudgetRepo::create(pool, req).await
    }
    
    pub async fn update(pool: &DbPool, id: &str, req: UpdateBudgetReq) -> Result<Budget, AppError> {
        // Get current budget
        let mut budget = Self::get(pool, id).await?;
        
        // Update fields if provided
        if let Some(name) = req.name {
            budget.name = name;
        }
        if let Some(description) = req.description {
            budget.description = Some(description);
        }
        if let Some(currency_code) = req.currency_code {
            budget.currency_code = currency_code;
        }
        if let Some(archived) = req.archived {
            budget.archived = archived;
        }
        
        budget.updated_at = chrono::Utc::now().naive_utc();
        
        BudgetRepo::update(pool, &budget).await
    }
    
    pub async fn delete(pool: &DbPool, id: &str) -> Result<(), AppError> {
        // Check if budget exists
        Self::get(pool, id).await?;
        BudgetRepo::delete(pool, id).await
    }
    
    pub async fn get_balance(pool: &DbPool, id: &str) -> Result<(i64, i64), AppError> {
        BudgetRepo::get_balance(pool, id).await
    }
}
