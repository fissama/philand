use crate::manager::{models::budget::{Budget, CreateBudgetReq}};
use crate::utils::{database::database::DbPool, error::error::AppError};
pub struct BudgetRepo;

impl BudgetRepo {
    pub async fn list(pool: &DbPool, owner_id: Option<String>, query: Option<String>) -> Result<Vec<Budget>, AppError> {
        let mut sql = String::from("SELECT * FROM budgets WHERE 1=1");
        let mut bindings = Vec::new();
        
        if let Some(oid) = owner_id {
            sql.push_str(" AND owner_id = ?");
            bindings.push(oid);
        }
        
        if let Some(q) = query {
            sql.push_str(" AND (name LIKE ? OR description LIKE ?)");
            let search_pattern = format!("%{}%", q);
            bindings.push(search_pattern.clone());
            bindings.push(search_pattern);
        }
        
        sql.push_str(" ORDER BY created_at DESC");
        
        let mut query_builder = sqlx::query_as::<_, Budget>(&sql);
        for binding in bindings {
            query_builder = query_builder.bind(binding);
        }
        
        Ok(query_builder.fetch_all(pool).await?)
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
    
    pub async fn update(pool: &DbPool, budget: &Budget) -> Result<Budget, AppError> {
        sqlx::query("UPDATE budgets SET name = ?, description = ?, currency_code = ?, archived = ?, updated_at = ? WHERE id = ?")
            .bind(&budget.name)
            .bind(&budget.description)
            .bind(&budget.currency_code)
            .bind(budget.archived)
            .bind(budget.updated_at)
            .bind(&budget.id)
            .execute(pool)
            .await?;
        Self::get(pool, &budget.id).await
    }
    
    pub async fn delete(pool: &DbPool, id: &str) -> Result<(), AppError> {
        let result = sqlx::query("DELETE FROM budgets WHERE id = ?")
            .bind(id)
            .execute(pool)
            .await?;
        if result.rows_affected() == 0 {
            return Err(AppError::NotFound);
        }
        Ok(())
    }
    
    pub async fn get_balance(pool: &DbPool, id: &str) -> Result<(i64, i64), AppError> {
        let result = sqlx::query_as::<_, (i64, i64)>(
            r#"
            SELECT 
                COALESCE(SUM(CASE WHEN kind = 'income' THEN amount_minor ELSE 0 END), 0) as income,
                COALESCE(SUM(CASE WHEN kind = 'expense' THEN amount_minor ELSE 0 END), 0) as expense
            FROM entries
            WHERE budget_id = ? AND deleted_at IS NULL
            "#
        )
        .bind(id)
        .fetch_one(pool)
        .await?;
        Ok(result)
    }
}
