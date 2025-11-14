use crate::manager::{models::member::{BudgetMember, BudgetMemberWithUser}, models::role::{Role}};
use crate::utils::{database::database::DbPool, error::error::AppError};
use sqlx::Row;

pub struct MemberRepo;

impl MemberRepo {
    pub async fn list(pool: &DbPool, budget_id: &str) -> Result<Vec<BudgetMember>, AppError> {
        Ok(sqlx::query_as::<_, BudgetMember>("SELECT budget_id, user_id, role FROM budget_members WHERE budget_id = ? ORDER BY role").bind(budget_id).fetch_all(pool).await?)
    }
    
    pub async fn list_with_users(pool: &DbPool, budget_id: &str) -> Result<Vec<BudgetMemberWithUser>, AppError> {
        let rows = sqlx::query(
            "SELECT bm.budget_id, bm.user_id, bm.role, u.name as user_name, u.email as user_email 
             FROM budget_members bm 
             INNER JOIN users u ON bm.user_id = u.id 
             WHERE bm.budget_id = ? 
             ORDER BY 
               CASE bm.role 
                 WHEN 'owner' THEN 0 
                 WHEN 'manager' THEN 1 
                 WHEN 'contributor' THEN 2 
                 WHEN 'viewer' THEN 3 
                 ELSE 4 
               END"
        )
        .bind(budget_id)
        .fetch_all(pool)
        .await?;

        let members = rows.into_iter().map(|row| {
            BudgetMemberWithUser {
                budget_id: row.get("budget_id"),
                user_id: row.get("user_id"),
                user_name: row.get("user_name"),
                user_email: row.get("user_email"),
                role: row.get("role"),
            }
        }).collect();

        Ok(members)
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
