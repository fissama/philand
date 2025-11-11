use crate::manager::{models::member::{BudgetMember}, models::role::{Role}};
use crate::utils::{database::database::DbPool, error::error::AppError};
use sqlx::Row;

pub struct MemberRepo;

impl MemberRepo {
    pub async fn list(pool: &DbPool, budget_id: &str) -> Result<Vec<BudgetMember>, AppError> {
        Ok(sqlx::query_as::<_, BudgetMember>("SELECT budget_id, user_id, role FROM budget_members WHERE budget_id = ? ORDER BY role").bind(budget_id).fetch_all(pool).await?)
    }
    pub async fn get_role(pool: &DbPool, budget_id: &str, user_id: &str) -> Result<Option<Role>, AppError> {
        let row = sqlx::query("SELECT role FROM budget_members WHERE budget_id = ? AND user_id = ?").bind(budget_id).bind(user_id).fetch_optional(pool).await?;
        Ok(row.and_then(|r| r.try_get::<String, _>("role").ok()).and_then(|s| Role::from_str(&s)))
    }
    pub async fn upsert(pool: &DbPool, budget_id: &str, user_id: &str, role: &str) -> Result<BudgetMember, AppError> {
        sqlx::query("INSERT INTO budget_members (budget_id, user_id, role) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE role = VALUES(role)")
            .bind(budget_id).bind(user_id).bind(role).execute(pool).await?;
        Ok(sqlx::query_as::<_, BudgetMember>("SELECT budget_id, user_id, role FROM budget_members WHERE budget_id=? AND user_id=?").bind(budget_id).bind(user_id).fetch_one(pool).await?)
    }
    pub async fn delete(pool: &DbPool, budget_id: &str, user_id: &str) -> Result<(), AppError> {
        sqlx::query("DELETE FROM budget_members WHERE budget_id=? AND user_id=?").bind(budget_id).bind(user_id).execute(pool).await?;
        Ok(())
    }
}
