use serde::{Deserialize, Serialize};
use crate::manager::models::user::User;

#[derive(Debug, Deserialize)]
pub struct GoogleAuthRequest {
    pub code: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GoogleTokenResponse {
    pub access_token: String,
    pub expires_in: i64,
    pub token_type: String,
    pub scope: String,
    pub id_token: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GoogleUserInfo {
    pub id: String,
    pub email: String,
    pub verified_email: bool,
    pub name: String,
    pub given_name: Option<String>,
    pub family_name: Option<String>,
    pub picture: Option<String>,
    pub locale: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct GoogleAuthResponse {
    pub token: String,
    pub user: User,
}