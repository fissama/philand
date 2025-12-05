use crate::manager::{models::budget::{Budget, BudgetWithRole, CreateBudgetReq, BudgetType}};
use crate::utils::{database::database::DbPool, error::error::AppError};
use sqlx::Row;
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
    
    pub async fn list_for_user(pool: &DbPool, user_id: &str, query: Option<String>) -> Result<Vec<Budget>, AppError> {
        let mut sql = String::from(
            "SELECT b.* FROM budgets b 
             INNER JOIN budget_members bm ON b.id = bm.budget_id 
             WHERE bm.user_id = ? AND b.archived = 0"
        );
        let mut bindings = vec![user_id.to_string()];
        
        if let Some(q) = query {
            sql.push_str(" AND (b.name LIKE ? OR b.description LIKE ?)");
            let search_pattern = format!("%{}%", q);
            bindings.push(search_pattern.clone());
            bindings.push(search_pattern);
        }
        
        sql.push_str(" ORDER BY b.created_at DESC");
        
        let mut query_builder = sqlx::query_as::<_, Budget>(&sql);
        for binding in bindings {
            query_builder = query_builder.bind(binding);
        }
        
        Ok(query_builder.fetch_all(pool).await?)
    }
    
    pub async fn list_with_roles_for_user(pool: &DbPool, user_id: &str, query: Option<String>) -> Result<Vec<BudgetWithRole>, AppError> {
        let mut sql = String::from(
            "SELECT b.id, b.owner_id, b.name, b.currency_code, b.budget_type, b.description, b.archived, 
                    b.created_at, b.updated_at, bm.role as user_role
             FROM budgets b 
             INNER JOIN budget_members bm ON b.id = bm.budget_id 
             WHERE bm.user_id = ? AND b.archived = 0"
        );
        let mut bindings = vec![user_id.to_string()];
        
        if let Some(q) = query {
            sql.push_str(" AND (b.name LIKE ? OR b.description LIKE ?)");
            let search_pattern = format!("%{}%", q);
            bindings.push(search_pattern.clone());
            bindings.push(search_pattern);
        }
        
        sql.push_str(" ORDER BY b.created_at DESC");
        
        let rows = sqlx::query(&sql);
        let mut query_builder = rows;
        for binding in bindings {
            query_builder = query_builder.bind(binding);
        }
        
        let results = query_builder.fetch_all(pool).await?;
        
        let budgets = results.into_iter().map(|row| {
            let budget_type_str: String = row.get("budget_type");
            let budget_type = budget_type_str.parse::<BudgetType>().unwrap_or(BudgetType::Standard);
            
            BudgetWithRole {
                id: row.get("id"),
                owner_id: row.get("owner_id"),
                name: row.get("name"),
                currency_code: row.get("currency_code"),
                budget_type,
                description: row.get("description"),
                archived: row.get("archived"),
                created_at: row.get("created_at"),
                updated_at: row.get("updated_at"),
                user_role: row.get("user_role"),
            }
        }).collect();
        
        Ok(budgets)
    }
    
    pub async fn get(pool: &DbPool, id: &str) -> Result<Budget, AppError> {
        sqlx::query_as::<_, Budget>("SELECT * FROM budgets WHERE id = ?").bind(id).fetch_optional(pool).await?
            .ok_or(AppError::NotFound)
    }
    pub async fn create(pool: &DbPool, req: CreateBudgetReq) -> Result<Budget, AppError> {
        let id = uuid::Uuid::new_v4().to_string();
        let currency = req.currency_code.unwrap_or_else(|| "USD".to_string());
        let budget_type = req.budget_type.unwrap_or(BudgetType::Standard);
        sqlx::query("INSERT INTO budgets (id, owner_id, name, currency_code, budget_type, description) VALUES (?, ?, ?, ?, ?, ?)")
            .bind(&id).bind(&req.owner_id).bind(&req.name).bind(&currency).bind(budget_type.to_string()).bind(&req.description).execute(pool).await?;
        sqlx::query("INSERT INTO budget_members (budget_id, user_id, role) VALUES (?, ?, 'owner')")
            .bind(&id).bind(&req.owner_id).execute(pool).await?;
        Self::get(pool, &id).await
    }
    
    pub async fn update(pool: &DbPool, budget: &Budget) -> Result<Budget, AppError> {
        sqlx::query("UPDATE budgets SET name = ?, description = ?, currency_code = ?, budget_type = ?, archived = ?, updated_at = ? WHERE id = ?")
            .bind(&budget.name)
            .bind(&budget.description)
            .bind(&budget.currency_code)
            .bind(budget.budget_type.to_string())
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
                CAST(COALESCE(SUM(CASE WHEN kind = 'income' THEN amount_minor ELSE 0 END), 0) AS SIGNED) as income,
                CAST(COALESCE(SUM(CASE WHEN kind = 'expense' THEN amount_minor ELSE 0 END), 0) AS SIGNED) as expense
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
