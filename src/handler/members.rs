use std::sync::Arc;
use axum::{extract::{State, Path}, Json, Extension};
use crate::manager::models::{member::{BudgetMember, UpsertMemberReq, UpdateMemberReq}};
use crate::manager::biz::members::MemberService;
use crate::utils::error::error::AppError;
use super::AppState;

pub async fn list(State(state): State<Arc<AppState>>, Extension(claims): Extension<crate::handler::auth::Claims>, Path(budget_id): Path<String>) -> Result<Json<Vec<BudgetMember>>, AppError> {
    crate::manager::biz::authz::ensure_owner(&state.pool, &budget_id, &claims.sub).await?;
    Ok(Json(MemberService::list(&state.pool, &budget_id).await?))
}

pub async fn upsert(State(state): State<Arc<AppState>>, Extension(claims): Extension<crate::handler::auth::Claims>, Path(budget_id): Path<String>, Json(req): Json<UpsertMemberReq>) -> Result<Json<BudgetMember>, AppError> {
    crate::manager::biz::authz::ensure_owner(&state.pool, &budget_id, &claims.sub).await?;
    Ok(Json(MemberService::upsert(&state.pool, &budget_id, req).await?))
}

pub async fn update(State(state): State<Arc<AppState>>, Extension(claims): Extension<crate::handler::auth::Claims>, Path((budget_id, user_id)): Path<(String, String)>, Json(req): Json<UpdateMemberReq>) -> Result<Json<BudgetMember>, AppError> {
    crate::manager::biz::authz::ensure_owner(&state.pool, &budget_id, &claims.sub).await?;
    Ok(Json(MemberService::upsert(&state.pool, &budget_id, crate::manager::models::member::UpsertMemberReq { user_id, role: req.role }).await?))
}

pub async fn delete(State(state): State<Arc<AppState>>, Extension(claims): Extension<crate::handler::auth::Claims>, Path((budget_id, user_id)): Path<(String, String)>) -> Result<(), AppError> {
    crate::manager::biz::authz::ensure_owner(&state.pool, &budget_id, &claims.sub).await?;
    MemberService::delete(&state.pool, &budget_id, &user_id).await?;
    Ok(())
}
