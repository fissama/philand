use std::sync::Arc;
use axum::{extract::{Query, Path, State}, Json, Extension};
use serde::Deserialize;
use crate::manager::models::{budget::{Budget, CreateBudgetReq}};
use crate::manager::biz::budgets::BudgetService;
use crate::utils::error::error::AppError;
use super::{AppState};

#[derive(Deserialize)]
pub struct BudgetFilter { owner_id: Option<String> }

pub async fn list(State(state): State<Arc<AppState>>, Query(filter): Query<BudgetFilter>) -> Result<Json<Vec<Budget>>, AppError> {
    Ok(Json(BudgetService::list(&state.pool, filter.owner_id).await?))
}
pub async fn get(State(state): State<Arc<AppState>>, Path(id): Path<String>) -> Result<Json<Budget>, AppError> {
    Ok(Json(BudgetService::get(&state.pool, &id).await?))
}
pub async fn create(State(state): State<Arc<AppState>>, Extension(claims): Extension<crate::handler::auth::Claims>, Json(mut req): Json<CreateBudgetReq>) -> Result<Json<Budget>, AppError> {
    req.owner_id = claims.sub.clone();
    Ok(Json(BudgetService::create(&state.pool, req).await?))
}
