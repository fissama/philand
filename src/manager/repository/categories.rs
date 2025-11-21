use crate::manager::{models::category::{Category, CreateCategoryReq}};
use crate::utils::{database::database::DbPool, error::error::AppError};

pub struct CategoryRepo;

impl CategoryRepo {
    pub async fn list(pool: &DbPool, budget_id: &str, kind: Option<String>) -> Result<Vec<Category>, AppError> {
        let rows = if let Some(k) = kind {
            sqlx::query_as::<_, Category>("SELECT id, budget_id, name, kind, is_hidden, color, icon, created_at, updated_at FROM categories WHERE budget_id = ? AND kind = ? ORDER BY name ASC")
                .bind(budget_id).bind(k).fetch_all(pool).await?
        } else {
            sqlx::query_as::<_, Category>("SELECT id, budget_id, name, kind, is_hidden, color, icon, created_at, updated_at FROM categories WHERE budget_id = ? ORDER BY name ASC")
                .bind(budget_id).fetch_all(pool).await?
        };
        Ok(rows)
    }
    pub async fn create(pool: &DbPool, budget_id: &str, req: CreateCategoryReq) -> Result<Category, AppError> {
        let id = uuid::Uuid::new_v4().to_string();
        let hidden = req.is_hidden.unwrap_or(false);
        let now = chrono::Utc::now();
        
        sqlx::query("INSERT INTO categories (id, budget_id, name, kind, is_hidden, color, icon, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")
            .bind(&id)
            .bind(budget_id)
            .bind(&req.name)
            .bind(&req.kind)
            .bind(hidden)
            .bind(&req.color)
            .bind(&req.icon)
            .bind(&now)
            .bind(&now)
            .execute(pool).await?;
            
        Ok(sqlx::query_as::<_, Category>("SELECT id, budget_id, name, kind, is_hidden, color, icon, created_at, updated_at FROM categories WHERE id = ?")
            .bind(&id).fetch_one(pool).await?)
    }

    pub async fn update(pool: &DbPool, budget_id: &str, category_id: &str, req: crate::manager::models::category::UpdateCategoryReq) -> Result<Category, AppError> {
        let now = chrono::Utc::now();
        
        // Get current category first
        let current = Self::get_by_id(pool, budget_id, category_id).await?;
        
        // Use current values as defaults for fields not being updated
        let name = req.name.as_ref().unwrap_or(&current.name);
        let kind = req.kind.as_ref().unwrap_or(&current.kind);
        let is_hidden = req.is_hidden.unwrap_or(current.is_hidden);
        let color = req.color.as_ref().or(current.color.as_ref());
        let icon = req.icon.as_ref().or(current.icon.as_ref());
        
        sqlx::query("UPDATE categories SET name = ?, kind = ?, is_hidden = ?, color = ?, icon = ?, updated_at = ? WHERE id = ? AND budget_id = ?")
            .bind(name)
            .bind(kind)
            .bind(is_hidden)
            .bind(color)
            .bind(icon)
            .bind(&now)
            .bind(category_id)
            .bind(budget_id)
            .execute(pool).await?;
        
        Ok(sqlx::query_as::<_, Category>("SELECT id, budget_id, name, kind, is_hidden, color, icon, created_at, updated_at FROM categories WHERE id = ? AND budget_id = ?")
            .bind(category_id).bind(budget_id).fetch_one(pool).await?)
    }

    pub async fn delete(pool: &DbPool, budget_id: &str, category_id: &str) -> Result<(), AppError> {
        let result = sqlx::query("DELETE FROM categories WHERE id = ? AND budget_id = ?")
            .bind(category_id).bind(budget_id).execute(pool).await?;
            
        if result.rows_affected() == 0 {
            return Err(AppError::NotFound);
        }
        
        Ok(())
    }

    pub async fn get_by_id(pool: &DbPool, budget_id: &str, category_id: &str) -> Result<Category, AppError> {
        Ok(sqlx::query_as::<_, Category>("SELECT id, budget_id, name, kind, is_hidden, color, icon, created_at, updated_at FROM categories WHERE id = ? AND budget_id = ?")
            .bind(category_id).bind(budget_id).fetch_one(pool).await?)
    }
}
