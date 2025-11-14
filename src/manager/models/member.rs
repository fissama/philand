
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Serialize, FromRow)]
pub struct BudgetMember {
    pub budget_id: String,
    pub user_id: String,
    pub role: String,
}

#[derive(Debug, Serialize)]
pub struct BudgetMemberWithUser {
    pub budget_id: String,
    pub user_id: String,
    pub user_name: Option<String>,
    pub user_email: String,
    pub role: String,
}

#[derive(Debug, Deserialize)]
pub struct UpsertMemberReq { pub email: String, pub role: String }

#[derive(Debug, Deserialize)]
pub struct UpdateMemberReq { pub role: String }
