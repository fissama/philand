use std::sync::Arc;
use axum::{extract::State, Json};
use crate::manager::models::{user::{User}};
use crate::manager::biz::users::UserService;
use crate::utils::error::error::AppError;
use super::AppState;

pub async fn list(State(state): State<Arc<AppState>>) -> Result<Json<Vec<User>>, AppError> { 
    Ok(Json(UserService::list(&state.pool).await?)) 
}

// pub async fn signup(State(state): State<Arc<AppState>>, Json(req): Json<CreateUserReq>) -> Result<Json<User>, AppError> {
//     let cost = get_config().get_jwt_config().get_bcrypt_cost();
//     Ok(Json(UserService::create(&state.pool, req, cost).await?))
// }