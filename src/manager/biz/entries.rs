use crate::manager::{models::entry::{Entry, CreateEntryReq}};
use crate::utils::{database::database::DbPool, error::error::AppError};
use crate::manager::{repository::entries::EntryRepo, repository::budgets::BudgetRepo};
pub struct EntryService;

impl EntryService {
    pub async fn list(pool: &DbPool, budget_id: &str, from: Option<chrono::NaiveDate>, to: Option<chrono::NaiveDate>, kind: Option<String>) -> Result<Vec<Entry>, AppError> {
        EntryRepo::list(pool, budget_id, from, to, kind).await
    }
    pub async fn create(pool: &DbPool, budget_id: &str, req: CreateEntryReq) -> Result<Entry, AppError> {
        let budget = BudgetRepo::get(pool, budget_id).await?;
        EntryRepo::create(pool, budget_id, req, &budget.currency_code).await
    }
    pub async fn monthly_summary(pool: &DbPool, budget_id: &str, from: chrono::NaiveDate, to: chrono::NaiveDate)
        -> Result<Vec<(chrono::NaiveDate, i64, i64, i64)>, AppError> {
        EntryRepo::monthly_summary(pool, budget_id, from, to).await
    }
}
