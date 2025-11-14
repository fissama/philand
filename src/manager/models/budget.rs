use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Serialize, FromRow)]
pub struct Budget {
    pub id: String,
    pub owner_id: String,
    pub name: String,
    pub currency_code: String,
    pub description: Option<String>,
    pub archived: bool,
    pub created_at: chrono::NaiveDateTime,
    pub updated_at: chrono::NaiveDateTime,
}

#[derive(Debug, Serialize)]
pub struct BudgetWithRole {
    pub id: String,
    pub owner_id: String,
    pub name: String,
    pub currency_code: String,
    pub description: Option<String>,
    pub archived: bool,
    pub created_at: chrono::NaiveDateTime,
    pub updated_at: chrono::NaiveDateTime,
    pub user_role: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateBudgetReq {
    #[serde(skip_deserializing)]
    pub owner_id: String,
    pub name: String,
    pub currency_code: Option<String>,
    pub description: Option<String>,
}

