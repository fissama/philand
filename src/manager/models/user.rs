use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Serialize, FromRow)]
pub struct User {
    pub id: String,
    pub email: String,
    pub name: Option<String>,
    pub created_at: chrono::NaiveDateTime,
}

#[derive(Debug, Deserialize)]
pub struct CreateUserReq {
    pub email: String,
    pub name: Option<String>,
    pub password: String,
}

