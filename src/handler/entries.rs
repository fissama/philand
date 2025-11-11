use std::sync::Arc;
use axum::{extract::{Query, Path, State}, Json, Extension};
use serde::Deserialize;
use crate::manager::models::{entry::{Entry, CreateEntryReq}};
use crate::manager::biz::entries::EntryService;
use crate::utils::error::error::AppError;
use super::AppState;

#[derive(Deserialize)]
pub struct EntryFilter {
    from: Option<chrono::NaiveDate>,
    to: Option<chrono::NaiveDate>,
    kind: Option<String>,
}

pub async fn list(State(state): State<Arc<AppState>>, Path(budget_id): Path<String>, Query(filter): Query<EntryFilter>) -> Result<Json<Vec<Entry>>, AppError> {
    Ok(Json(EntryService::list(&state.pool, &budget_id, filter.from, filter.to, filter.kind).await?))
}
pub async fn create(State(state): State<Arc<AppState>>, Extension(claims): Extension<crate::handler::auth::Claims>, Path(budget_id): Path<String>, Json(mut req): Json<CreateEntryReq>) -> Result<Json<Entry>, AppError> {
    crate::manager::biz::authz::ensure_role(&state.pool, &budget_id, &claims.sub, crate::manager::models::role::Role::Contributor).await?;
    req.created_by = claims.sub.clone();
    Ok(Json(EntryService::create(&state.pool, &budget_id, req).await?))
}