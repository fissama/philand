use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use chrono::{NaiveDateTime, Utc};

#[derive(Debug, FromRow)]
pub struct NotificationRow {
    pub id: String,
    pub user_id: String,
    pub budget_id: String,
    pub notification_type: String,
    pub title: String,
    pub message: String,
    pub link_url: Option<String>,
    pub related_id: Option<String>,
    pub is_read: bool,
    pub created_at: NaiveDateTime,
    pub read_at: Option<NaiveDateTime>,
}

#[derive(Debug, Serialize)]
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
    #[serde(serialize_with = "serialize_datetime_as_utc")]
    pub created_at: NaiveDateTime,
    #[serde(serialize_with = "serialize_optional_datetime_as_utc")]
    pub read_at: Option<NaiveDateTime>,
}

fn serialize_datetime_as_utc<S>(dt: &NaiveDateTime, serializer: S) -> Result<S::Ok, S::Error>
where
    S: serde::Serializer,
{
    // Assume database datetime is in UTC and convert to RFC3339 format
    let utc_dt = dt.and_utc();
    serializer.serialize_str(&utc_dt.to_rfc3339())
}

fn serialize_optional_datetime_as_utc<S>(dt: &Option<NaiveDateTime>, serializer: S) -> Result<S::Ok, S::Error>
where
    S: serde::Serializer,
{
    match dt {
        Some(dt) => {
            let utc_dt = dt.and_utc();
            serializer.serialize_some(&utc_dt.to_rfc3339())
        }
        None => serializer.serialize_none(),
    }
}

impl From<NotificationRow> for Notification {
    fn from(row: NotificationRow) -> Self {
        Self {
            id: row.id,
            user_id: row.user_id,
            budget_id: row.budget_id,
            notification_type: row.notification_type,
            title: row.title,
            message: row.message,
            link_url: row.link_url,
            related_id: row.related_id,
            is_read: row.is_read,
            created_at: row.created_at,
            read_at: row.read_at,
        }
    }
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

// #[derive(Debug, Deserialize)]
// pub struct MarkReadReq {
//     pub notification_ids: Vec<String>,
// }
