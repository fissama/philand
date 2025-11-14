
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Serialize, FromRow)]
pub struct Entry {
    pub id: String,
    pub budget_id: String,
    pub category_id: String,
    pub kind: String,
    pub amount_minor: i64,
    pub currency_code: String,
    pub entry_date: chrono::NaiveDate,
    pub description: Option<String>,
    pub counterparty: Option<String>,
    pub created_by: String,
    pub updated_by: Option<String>,
    pub created_at: chrono::NaiveDateTime,
    pub updated_at: Option<chrono::NaiveDateTime>,
    pub deleted_at: Option<chrono::NaiveDateTime>,
}

#[derive(Debug, Deserialize)]
pub struct CreateEntryReq {
    pub category_id: Option<String>,
    pub kind: String,
    pub amount_minor: i64,
    pub currency_code: Option<String>,
    pub entry_date: chrono::NaiveDate,
    pub description: Option<String>,
    pub counterparty: Option<String>,
    #[serde(skip_deserializing)]
    pub created_by: String,
}