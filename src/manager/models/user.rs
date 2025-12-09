use serde::{Deserialize, Serialize, Serializer};
use sqlx::FromRow;

fn serialize_avatar<S>(avatar: &Option<String>, serializer: S) -> Result<S::Ok, S::Error>
where
    S: Serializer,
{
    match avatar {
        Some(data) if !data.is_empty() => {
            // Return as-is if it's already a data URL or HTTP(S) URL
            if data.starts_with("data:image") || data.starts_with("http://") || data.starts_with("https://") {
                serializer.serialize_some(data)
            } else {
                // Legacy: wrap raw base64 with data URL prefix
                serializer.serialize_some(&format!("data:image/webp;base64,{}", data))
            }
        }
        _ => serializer.serialize_none(),
    }
}

#[derive(Debug, Serialize, FromRow)]
pub struct User {
    pub id: String,
    pub email: String,
    pub name: Option<String>,
    #[serde(serialize_with = "serialize_avatar")]
    pub avatar: Option<String>,
    pub bio: Option<String>,
    pub timezone: String,
    pub locale: String,
    pub created_at: chrono::NaiveDateTime,
    pub updated_at: chrono::NaiveDateTime,
}

#[derive(Debug, Deserialize)]
pub struct CreateUserReq {
    pub email: String,
    pub name: Option<String>,
    pub password: String,
}

#[derive(Debug, Deserialize)]
pub struct UpdateProfileReq {
    pub name: Option<String>,
    pub bio: Option<String>,
    pub timezone: Option<String>,
    pub locale: Option<String>,
}

// #[derive(Debug, Deserialize)]
// pub struct UploadAvatarReq {
//     pub avatar: String,
// }

