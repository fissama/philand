use std::sync::Arc;
use axum::{extract::{Query, Path, State}, Json, Extension};
use serde::{Deserialize, Serialize};
use crate::manager::models::{entry::{Entry, CreateEntryReq}};
use crate::manager::biz::entries::EntryService;
use crate::utils::error::error::AppError;
use super::AppState;

#[derive(Deserialize)]
pub struct EntryFilter {
    from: Option<chrono::NaiveDate>,
    to: Option<chrono::NaiveDate>,
    kind: Option<String>,
    category_id: Option<String>,
    search: Option<String>,
    sort_by: Option<String>, // "date" (default), "amount"
    sort_order: Option<String>, // "desc" (default), "asc"
    page: Option<u32>,
    per_page: Option<u32>, // 10, 30 (default), 100
}

#[derive(Deserialize)]
pub struct UpdateEntryReq {
    pub category_id: Option<String>,
    pub kind: Option<String>,
    pub amount_minor: Option<i64>,
    pub entry_date: Option<chrono::NaiveDate>,
    pub description: Option<String>,
    pub counterparty: Option<String>,
}

#[derive(Serialize)]
pub struct DeleteEntryResp {
    pub message: String,
}

pub async fn list(State(state): State<Arc<AppState>>, Extension(claims): Extension<crate::handler::auth::Claims>, Path(budget_id): Path<String>, Query(filter): Query<EntryFilter>) -> Result<Json<Vec<Entry>>, AppError> {
    // Ensure user has at least viewer access to this budget
    crate::manager::biz::authz::ensure_role(&state.pool, &budget_id, &claims.sub, crate::manager::models::role::Role::Viewer).await?;
    Ok(Json(EntryService::list(
        &state.pool,
        &budget_id,
        filter.from,
        filter.to,
        filter.kind,
        filter.category_id,
        filter.search,
        filter.sort_by,
        filter.sort_order,
        filter.page,
        filter.per_page,
    ).await?))
}
pub async fn create(State(state): State<Arc<AppState>>, Extension(claims): Extension<crate::handler::auth::Claims>, Path(budget_id): Path<String>, Json(mut req): Json<CreateEntryReq>) -> Result<Json<Entry>, AppError> {
    crate::manager::biz::authz::ensure_role(&state.pool, &budget_id, &claims.sub, crate::manager::models::role::Role::Contributor).await?;
    req.created_by = claims.sub.clone();
    Ok(Json(EntryService::create(&state.pool, &budget_id, req).await?))
}

pub async fn update(State(state): State<Arc<AppState>>, Extension(claims): Extension<crate::handler::auth::Claims>, Path((budget_id, entry_id)): Path<(String, String)>, Json(req): Json<UpdateEntryReq>) -> Result<Json<Entry>, AppError> {
    crate::manager::biz::authz::ensure_role(&state.pool, &budget_id, &claims.sub, crate::manager::models::role::Role::Contributor).await?;
    Ok(Json(EntryService::update(&state.pool, &budget_id, &entry_id, req, &claims.sub).await?))
}

pub async fn delete(State(state): State<Arc<AppState>>, Extension(claims): Extension<crate::handler::auth::Claims>, Path((budget_id, entry_id)): Path<(String, String)>) -> Result<Json<DeleteEntryResp>, AppError> {
    crate::manager::biz::authz::ensure_role(&state.pool, &budget_id, &claims.sub, crate::manager::models::role::Role::Contributor).await?;
    EntryService::delete(&state.pool, &budget_id, &entry_id, &claims.sub).await?;
    Ok(Json(DeleteEntryResp {
        message: "Entry deleted successfully".to_string(),
    }))
}