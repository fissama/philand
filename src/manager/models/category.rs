use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Serialize, FromRow)]
pub struct Category {
    pub id: String,
    pub budget_id: String,
    pub name: String,
    pub kind: String,
    pub is_hidden: bool,
}

#[derive(Debug, Deserialize)]
pub struct CreateCategoryReq { pub name: String, pub kind: String, pub is_hidden: Option<bool> }