use crate::manager::{models::entry::{Entry, CreateEntryReq}};
use crate::utils::{database::database::DbPool, error::error::AppError};
pub struct EntryRepo;

impl EntryRepo {
pub async fn list(pool: &DbPool, budget_id: &str, from: Option<chrono::NaiveDate>, to: Option<chrono::NaiveDate>, kind: Option<String>) -> Result<Vec<Entry>, AppError> {
    let mut q = String::from("SELECT * FROM entries WHERE budget_id = ? AND deleted_at IS NULL");
    if kind.is_some() { q.push_str(" AND kind = ?"); }
    if from.is_some() { q.push_str(" AND entry_date >= ?"); }
    if to.is_some() { q.push_str(" AND entry_date <= ?"); }
    q.push_str(" ORDER BY entry_date DESC, created_at DESC");
    let mut query = sqlx::query_as::<_, Entry>(&q).bind(budget_id);
    if let Some(k) = kind { query = query.bind(k); }
    if let Some(f) = from { query = query.bind(f); }
    if let Some(t) = to { query = query.bind(t); }
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
    Ok(sqlx::query_as::<_, Entry>("SELECT * FROM entries WHERE id = ?").bind(&id).fetch_one(pool).await?)
}
pub async fn monthly_summary(pool: &DbPool, budget_id: &str, from: chrono::NaiveDate, to: chrono::NaiveDate)
                             -> Result<Vec<(chrono::NaiveDate, i64, i64, i64)>, AppError>
{
    Ok(sqlx::query_as::<_, (chrono::NaiveDate, i64, i64, i64)>(r#"
            SELECT DATE_FORMAT(entry_date, '%Y-%m-01') as month_start,
                   SUM(CASE WHEN kind='income'  THEN amount_minor ELSE 0 END) AS income_minor,
                   SUM(CASE WHEN kind='expense' THEN amount_minor ELSE 0 END) AS expense_minor,
                   SUM(CASE WHEN kind='income'  THEN amount_minor ELSE -amount_minor END) AS net_minor
            FROM entries
            WHERE budget_id = ? AND deleted_at IS NULL
              AND entry_date BETWEEN ? AND ?
            GROUP BY month_start
            ORDER BY month_start
        "#).bind(budget_id).bind(from).bind(to).fetch_all(pool).await?)
}
}
