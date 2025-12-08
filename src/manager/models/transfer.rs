use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Serialize, FromRow)]
pub struct BudgetTransfer {
    pub id: String,
    pub from_budget_id: String,
    pub to_budget_id: String,
    pub amount_minor: i64,
    pub currency_code: String,
    pub transfer_date: chrono::NaiveDate,
    pub note: Option<String>,
    pub created_by: String,
    pub created_at: chrono::NaiveDateTime,
}

#[derive(Debug, Deserialize)]
pub struct CreateTransferReq {
    pub from_budget_id: String,
    pub to_budget_id: String,
    pub amount_minor: i64,
    pub currency_code: String,
    pub transfer_date: chrono::NaiveDate,
    pub note: Option<String>,
    pub from_category_id: String,
    pub to_category_id: String,
}

#[derive(Debug, Serialize)]
pub struct TransferWithEntries {
    pub transfer: BudgetTransfer,
    pub from_entry_id: String,
    pub to_entry_id: String,
    pub from_budget_name: String,
    pub to_budget_name: String,
}
