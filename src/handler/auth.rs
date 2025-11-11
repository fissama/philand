use axum::{body::Body, Json, extract::State, http::Request, middleware::Next, response::IntoResponse};
use headers::{authorization::Bearer, Authorization, HeaderMapExt};
use jsonwebtoken::{encode, decode, EncodingKey, DecodingKey, Header, Validation, Algorithm};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use time::{Duration, OffsetDateTime};
use bcrypt::verify;

use crate::manager::models::{user::{User, CreateUserReq}};
use crate::manager::biz::users::UserService;
use crate::utils::error::error::AppError;
use crate::config::config::get_config;
use super::AppState;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Claims { pub sub: String, pub email: String, pub exp: usize }

fn encoding_key() -> EncodingKey {
    let secret = get_config().get_jwt_config().get_secret();
    EncodingKey::from_secret(secret.as_bytes())
}
fn decoding_key() -> DecodingKey {
    let secret = get_config().get_jwt_config().get_secret();
    DecodingKey::from_secret(secret.as_bytes())
}

#[derive(Deserialize)] pub struct LoginReq { pub email: String, pub password: String }
#[derive(Serialize)] pub struct LoginResp { pub token: String, pub user: User }

pub async fn signup(State(state): State<Arc<AppState>>, Json(req): Json<CreateUserReq>) -> Result<Json<User>, AppError> {
    let cost = get_config().get_jwt_config().get_bcrypt_cost();
    Ok(Json(UserService::create(&state.pool, req, cost).await?))
}

pub async fn login(State(state): State<Arc<AppState>>, Json(req): Json<LoginReq>) -> Result<Json<LoginResp>, AppError> {
    let auth = UserService::find_auth(&state.pool, &req.email).await?;
    let (user_id, password_hash) = auth.ok_or(AppError::Unauthorized)?;
    let valid = verify(&req.password, &password_hash).map_err(|_| AppError::Internal)?;
    if !valid { return Err(AppError::Unauthorized); }
    let user = sqlx::query_as::<_, User>("SELECT id, email, name, created_at FROM users WHERE id = ?").bind(&user_id).fetch_one(&state.pool).await?;
    let ttl_min: i64 = get_config().get_jwt_config().get_ttl_min();
    let exp = (OffsetDateTime::now_utc() + Duration::minutes(ttl_min)).unix_timestamp() as usize;
    let claims = Claims { sub: user.id.clone(), email: user.email.clone(), exp };
    let token = encode(&Header::new(Algorithm::HS256), &claims, &encoding_key()).map_err(|_| AppError::Internal)?;
    Ok(Json(LoginResp { token, user }))
}

pub async fn auth_middleware(mut req: Request<Body>, next: Next) -> Result<impl IntoResponse, AppError> {
    let headers = req.headers();
    let auth = headers.typed_get::<Authorization<Bearer>>().ok_or(AppError::Unauthorized)?;
    let token_data = decode::<Claims>(auth.token(), &decoding_key(), &Validation::new(Algorithm::HS256))
        .map_err(|_| AppError::Unauthorized)?;
    req.extensions_mut().insert(token_data.claims);
    Ok(next.run(req).await)
}
