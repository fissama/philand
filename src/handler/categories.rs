use std::sync::Arc;
use axum::{extract::{Query, Path, State}, Json, Extension};
use serde::Deserialize;
use crate::manager::models::{category::{Category, CreateCategoryReq}};
use crate::manager::biz::categories::CategoryService;
use crate::utils::error::error::AppError;
use super::AppState;

#[derive(Deserialize)]
pub struct CategoryFilter { kind: Option<String> }

pub async fn list(State(state): State<Arc<AppState>>, Extension(claims): Extension<crate::handler::auth::Claims>, Path(budget_id): Path<String>, Query(filter): Query<CategoryFilter>) -> Result<Json<Vec<Category>>, AppError> {
    // Ensure user has at least viewer access to this budget
    crate::manager::biz::authz::ensure_role(&state.pool, &budget_id, &claims.sub, crate::manager::models::role::Role::Viewer).await?;
    Ok(Json(CategoryService::list(&state.pool, &budget_id, filter.kind).await?))
}
pub async fn create(State(state): State<Arc<AppState>>, Extension(claims): Extension<crate::handler::auth::Claims>, Path(budget_id): Path<String>, Json(req): Json<CreateCategoryReq>) -> Result<Json<Category>, AppError> {
    crate::manager::biz::authz::ensure_role(&state.pool, &budget_id, &claims.sub, crate::manager::models::role::Role::Manager).await?;
    Ok(Json(CategoryService::create(&state.pool, &budget_id, req).await?))
}