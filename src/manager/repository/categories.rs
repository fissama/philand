use crate::manager::{models::category::{Category, CreateCategoryReq}};
use crate::utils::{database::database::DbPool, error::error::AppError};

pub struct CategoryRepo;

impl CategoryRepo {
    pub async fn list(pool: &DbPool, budget_id: &str, kind: Option<String>) -> Result<Vec<Category>, AppError> {
        let rows = if let Some(k) = kind {
            sqlx::query_as::<_, Category>("SELECT id, budget_id, name, kind, is_hidden FROM categories WHERE budget_id = ? AND kind = ? ORDER BY name ASC")
                .bind(budget_id).bind(k).fetch_all(pool).await?
        } else {
            sqlx::query_as::<_, Category>("SELECT id, budget_id, name, kind, is_hidden FROM categories WHERE budget_id = ? ORDER BY name ASC")
                .bind(budget_id).fetch_all(pool).await?
        };
        Ok(rows)
    }
    pub async fn create(pool: &DbPool, budget_id: &str, req: CreateCategoryReq) -> Result<Category, AppError> {
        let id = uuid::Uuid::new_v4().to_string();
        let hidden = req.is_hidden.unwrap_or(false);
        sqlx::query("INSERT INTO categories (id, budget_id, name, kind, is_hidden) VALUES (?, ?, ?, ?, ?)")
            .bind(&id).bind(budget_id).bind(&req.name).bind(&req.kind).bind(hidden).execute(pool).await?;
        Ok(sqlx::query_as::<_, Category>("SELECT id, budget_id, name, kind, is_hidden FROM categories WHERE id = ?").bind(&id).fetch_one(pool).await?)
    }
}
