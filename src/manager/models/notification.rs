use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Serialize, FromRow)]
pub struct Notification {
    pub id: String,
    pub user_id: String,
    pub budget_id: String,
    pub notification_type: String,
    pub title: String,
    pub message: String,
    pub link_url: Option<String>,
    pub related_id: Option<String>,
    pub is_read: bool,
    pub created_at: chrono::NaiveDateTime,
    pub read_at: Option<chrono::NaiveDateTime>,
}

#[derive(Debug, Deserialize)]
pub struct CreateNotificationReq {
    pub user_id: String,
    pub budget_id: String,
    pub notification_type: String,
    pub title: String,
    pub message: String,
    pub link_url: Option<String>,
    pub related_id: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct MarkReadReq {
    pub notification_ids: Vec<String>,
}
