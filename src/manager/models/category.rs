use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use chrono::{DateTime, Utc};

#[derive(Debug, Serialize, FromRow)]
pub struct Category {
    pub id: String,
    pub budget_id: String,
    pub name: String,
    pub kind: String,
    pub is_hidden: bool,
    pub color: Option<String>,
    pub icon: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateCategoryReq { 
    pub name: String, 
    pub kind: String, 
    pub is_hidden: Option<bool>,
    pub color: Option<String>,
    pub icon: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateCategoryReq { 
    pub name: Option<String>,
    pub kind: Option<String>, // Allow changing category type
    pub is_hidden: Option<bool>,
    pub color: Option<String>,
    pub icon: Option<String>,
}