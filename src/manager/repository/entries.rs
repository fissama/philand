use crate::manager::{models::entry::{Entry, CreateEntryReq}};
use crate::handler::entries::UpdateEntryReq;
use crate::utils::{database::database::DbPool, error::error::AppError};
pub struct EntryRepo;

impl EntryRepo {
    pub async fn list(
        pool: &DbPool,
        budget_id: &str,
        from: Option<chrono::NaiveDate>,
        to: Option<chrono::NaiveDate>,
        kind: Option<String>,
        category_id: Option<String>,
        member_id: Option<String>,
        search: Option<String>,
        sort_by: Option<String>,
        sort_order: Option<String>,
        page: Option<u32>,
        per_page: Option<u32>,
    ) -> Result<Vec<Entry>, AppError> {
        let mut q = String::from(
            "SELECT e.id, e.budget_id, e.category_id, e.kind, e.amount_minor, e.currency_code, \
             e.entry_date, e.description, e.counterparty, e.created_by, e.updated_by, \
             e.created_at, e.updated_at, e.deleted_at, \
             u.name as member_name, u.email as member_email, u.avatar as member_avatar \
             FROM entries e \
             INNER JOIN users u ON e.created_by = u.id \
             WHERE e.budget_id = ? AND e.deleted_at IS NULL"
        );
        
        // Filters
        if kind.is_some() { q.push_str(" AND e.kind = ?"); }
        if category_id.is_some() { q.push_str(" AND e.category_id = ?"); }
        if member_id.is_some() { q.push_str(" AND e.created_by = ?"); }
        if from.is_some() { q.push_str(" AND e.entry_date >= ?"); }
        if to.is_some() { q.push_str(" AND e.entry_date <= ?"); }
        
        // Search in description (supports Vietnamese with approximate matching)
        if search.is_some() {
            q.push_str(" AND (e.description LIKE ? OR e.counterparty LIKE ?)");
        }
        
        // Sorting
        let sort_field = match sort_by.as_deref() {
            Some("amount") => "e.amount_minor",
            Some("description") => "e.description",
            _ => "e.entry_date", // default to date
        };
        let order = match sort_order.as_deref() {
            Some("asc") => "ASC",
            _ => "DESC", // default to descending
        };
        q.push_str(&format!(" ORDER BY {} {}, e.created_at DESC", sort_field, order));
        
        // Pagination
        let per_page = per_page.unwrap_or(30).min(100); // default 30, max 100
        let page = page.unwrap_or(1).max(1); // default page 1, min 1
        let offset = (page - 1) * per_page;
        q.push_str(&format!(" LIMIT {} OFFSET {}", per_page, offset));
        
        // Build query with bindings
        let search_pattern = search.as_ref().map(|s| format!("%{}%", s));
        
        let mut query = sqlx::query_as::<_, Entry>(&q).bind(budget_id);
        if let Some(k) = kind { query = query.bind(k); }
        if let Some(c) = category_id { query = query.bind(c); }
        if let Some(m) = member_id { query = query.bind(m); }
        if let Some(f) = from { query = query.bind(f); }
        if let Some(t) = to { query = query.bind(t); }
        if let Some(ref pattern) = search_pattern {
            query = query.bind(pattern).bind(pattern);
        }
        
        Ok(query.fetch_all(pool).await?)
    }
    pub async fn create(pool: &DbPool, budget_id: &str, req: CreateEntryReq, default_currency: &str) -> Result<Entry, AppError> {
        let id = uuid::Uuid::new_v4().to_string();
        let currency = req.currency_code.unwrap_or_else(|| default_currency.to_string());
        sqlx::query(r#"
                INSERT INTO entries (id, budget_id, category_id, kind, amount_minor, currency_code, entry_date, description, counterparty, created_by)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            "#)
            .bind(&id).bind(budget_id).bind(&req.category_id).bind(&req.kind).bind(req.amount_minor)
            .bind(&currency).bind(req.entry_date).bind(&req.description).bind(&req.counterparty).bind(&req.created_by)
            .execute(pool).await?;
        Ok(sqlx::query_as::<_, Entry>(
            "SELECT e.*, u.name as member_name, u.email as member_email, u.avatar as member_avatar \
             FROM entries e \
             INNER JOIN users u ON e.created_by = u.id \
             WHERE e.id = ?"
        ).bind(&id).fetch_one(pool).await?)
    }
    
    pub async fn update(pool: &DbPool, budget_id: &str, entry_id: &str, req: UpdateEntryReq, user_id: &str) -> Result<Entry, AppError> {
        // First check if entry exists and belongs to the budget
        let mut entry = sqlx::query_as::<_, Entry>(
            "SELECT e.*, u.name as member_name, u.email as member_email, u.avatar as member_avatar \
             FROM entries e \
             INNER JOIN users u ON e.created_by = u.id \
             WHERE e.id = ? AND e.budget_id = ? AND e.deleted_at IS NULL"
        )
            .bind(entry_id)
            .bind(budget_id)
            .fetch_optional(pool)
            .await?
            .ok_or(AppError::NotFound)?;
        
        // Update fields if provided
        if let Some(category_id) = req.category_id {
            entry.category_id = category_id;
        }
        if let Some(kind) = req.kind {
            entry.kind = kind;
        }
        if let Some(amount_minor) = req.amount_minor {
            entry.amount_minor = amount_minor;
        }
        if let Some(entry_date) = req.entry_date {
            entry.entry_date = entry_date;
        }
        if let Some(description) = req.description {
            entry.description = Some(description);
        }
        if let Some(counterparty) = req.counterparty {
            entry.counterparty = Some(counterparty);
        }
        
        entry.updated_by = Some(user_id.to_string());
        entry.updated_at = Some(chrono::Utc::now().naive_utc());
        
        sqlx::query(r#"
            UPDATE entries 
            SET category_id = ?, kind = ?, amount_minor = ?, entry_date = ?, description = ?, counterparty = ?, updated_by = ?, updated_at = ?
            WHERE id = ? AND budget_id = ?
        "#)
        .bind(&entry.category_id)
        .bind(&entry.kind)
        .bind(entry.amount_minor)
        .bind(entry.entry_date)
        .bind(&entry.description)
        .bind(&entry.counterparty)
        .bind(&entry.updated_by)
        .bind(&entry.updated_at)
        .bind(entry_id)
        .bind(budget_id)
        .execute(pool)
        .await?;
        
        Ok(entry)
    }
    
    pub async fn delete(pool: &DbPool, budget_id: &str, entry_id: &str, user_id: &str) -> Result<(), AppError> {
        // Soft delete - set deleted_at timestamp
        let result = sqlx::query(r#"
            UPDATE entries 
            SET deleted_at = ?, updated_by = ?, updated_at = ?
            WHERE id = ? AND budget_id = ? AND deleted_at IS NULL
        "#)
        .bind(chrono::Utc::now().naive_utc())
        .bind(user_id)
        .bind(chrono::Utc::now().naive_utc())
        .bind(entry_id)
        .bind(budget_id)
        .execute(pool)
        .await?;
        
        if result.rows_affected() == 0 {
            return Err(AppError::NotFound);
        }
        
        Ok(())
    }
    pub async fn monthly_summary(pool: &DbPool, budget_id: &str, from: chrono::NaiveDate, to: chrono::NaiveDate)
                                 -> Result<Vec<(chrono::NaiveDate, i64, i64, i64)>, AppError>
    {
        Ok(sqlx::query_as::<_, (chrono::NaiveDate, i64, i64, i64)>(r#"
            SELECT DATE_SUB(entry_date, INTERVAL DAY(entry_date)-1 DAY) as month_start,
                   CAST(SUM(CASE WHEN kind='income'  THEN amount_minor ELSE 0 END) AS SIGNED) AS income_minor,
                   CAST(SUM(CASE WHEN kind='expense' THEN amount_minor ELSE 0 END) AS SIGNED) AS expense_minor,
                   CAST(SUM(CASE WHEN kind='income'  THEN amount_minor ELSE -amount_minor END) AS SIGNED) AS net_minor
            FROM entries
            WHERE budget_id = ? AND deleted_at IS NULL
              AND entry_date BETWEEN ? AND ?
            GROUP BY month_start
            ORDER BY month_start
        "#).bind(budget_id).bind(from).bind(to).fetch_all(pool).await?)
    }
}
