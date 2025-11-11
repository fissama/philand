use crate::manager::{models::budget::{Budget, CreateBudgetReq}};
use crate::utils::{database::database::DbPool, error::error::AppError};
pub struct BudgetRepo;

impl BudgetRepo {
    pub async fn list(pool: &DbPool, owner_id: Option<String>) -> Result<Vec<Budget>, AppError> {
        let rows = if let Some(oid) = owner_id {
            sqlx::query_as::<_, Budget>("SELECT * FROM budgets WHERE owner_id = ? ORDER BY created_at DESC").bind(oid).fetch_all(pool).await?
        } else {
            sqlx::query_as::<_, Budget>("SELECT * FROM budgets ORDER BY created_at DESC").fetch_all(pool).await?
        };
        Ok(rows)
    }
    pub async fn get(pool: &DbPool, id: &str) -> Result<Budget, AppError> {
        sqlx::query_as::<_, Budget>("SELECT * FROM budgets WHERE id = ?").bind(id).fetch_optional(pool).await?
            .ok_or(AppError::NotFound)
    }
    pub async fn create(pool: &DbPool, req: CreateBudgetReq) -> Result<Budget, AppError> {
        let id = uuid::Uuid::new_v4().to_string();
        let currency = req.currency_code.unwrap_or_else(|| "USD".to_string());
        sqlx::query("INSERT INTO budgets (id, owner_id, name, currency_code, description) VALUES (?, ?, ?, ?, ?)")
            .bind(&id).bind(&req.owner_id).bind(&req.name).bind(&currency).bind(&req.description).execute(pool).await?;
        sqlx::query("INSERT INTO budget_members (budget_id, user_id, role) VALUES (?, ?, 'owner')")
            .bind(&id).bind(&req.owner_id).execute(pool).await?;
        Self::get(pool, &id).await
    }
}
