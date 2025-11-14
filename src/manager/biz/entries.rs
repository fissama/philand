use crate::manager::{models::entry::{Entry, CreateEntryReq}};
use crate::handler::entries::UpdateEntryReq;
use crate::utils::{database::database::DbPool, error::error::AppError};
use crate::manager::{repository::entries::EntryRepo, repository::budgets::BudgetRepo};
pub struct EntryService;

impl EntryService {
    pub async fn list(
        pool: &DbPool,
        budget_id: &str,
        from: Option<chrono::NaiveDate>,
        to: Option<chrono::NaiveDate>,
        kind: Option<String>,
        category_id: Option<String>,
        search: Option<String>,
        sort_by: Option<String>,
        sort_order: Option<String>,
        page: Option<u32>,
        per_page: Option<u32>,
    ) -> Result<Vec<Entry>, AppError> {
        EntryRepo::list(pool, budget_id, from, to, kind, category_id, search, sort_by, sort_order, page, per_page).await
    }
    pub async fn create(pool: &DbPool, budget_id: &str, req: CreateEntryReq) -> Result<Entry, AppError> {
        let budget = BudgetRepo::get(pool, budget_id).await?;
        EntryRepo::create(pool, budget_id, req, &budget.currency_code).await
    }
    pub async fn update(pool: &DbPool, budget_id: &str, entry_id: &str, req: UpdateEntryReq, user_id: &str) -> Result<Entry, AppError> {
        EntryRepo::update(pool, budget_id, entry_id, req, user_id).await
    }
    
    pub async fn delete(pool: &DbPool, budget_id: &str, entry_id: &str, user_id: &str) -> Result<(), AppError> {
        EntryRepo::delete(pool, budget_id, entry_id, user_id).await
    }
    
    pub async fn monthly_summary(pool: &DbPool, budget_id: &str, from: chrono::NaiveDate, to: chrono::NaiveDate)
        -> Result<Vec<(chrono::NaiveDate, i64, i64, i64)>, AppError> {
        EntryRepo::monthly_summary(pool, budget_id, from, to).await
    }
}
