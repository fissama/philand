use std::sync::Arc;
use axum::{extract::{State, Path}, Json, Extension};
use crate::manager::models::{member::{BudgetMember, BudgetMemberWithUser, UpsertMemberReq, UpdateMemberReq}};
use crate::manager::biz::members::MemberService;
use crate::utils::error::error::AppError;
use super::AppState;

pub async fn list(State(state): State<Arc<AppState>>, Extension(claims): Extension<crate::handler::auth::Claims>, Path(budget_id): Path<String>) -> Result<Json<Vec<BudgetMemberWithUser>>, AppError> {
    // Allow any member (viewer or above) to see the member list
    crate::manager::biz::authz::ensure_role(&state.pool, &budget_id, &claims.sub, crate::manager::models::role::Role::Viewer).await?;
    Ok(Json(MemberService::list_with_users(&state.pool, &budget_id).await?))
}

pub async fn upsert(State(state): State<Arc<AppState>>, Extension(claims): Extension<crate::handler::auth::Claims>, Path(budget_id): Path<String>, Json(req): Json<UpsertMemberReq>) -> Result<Json<BudgetMember>, AppError> {
    crate::manager::biz::authz::ensure_owner(&state.pool, &budget_id, &claims.sub).await?;
    Ok(Json(MemberService::upsert(&state.pool, &budget_id, req).await?))
}

pub async fn update(State(state): State<Arc<AppState>>, Extension(claims): Extension<crate::handler::auth::Claims>, Path((budget_id, user_id)): Path<(String, String)>, Json(req): Json<UpdateMemberReq>) -> Result<Json<BudgetMember>, AppError> {
    crate::manager::biz::authz::ensure_owner(&state.pool, &budget_id, &claims.sub).await?;
    Ok(Json(MemberService::update_by_user_id(&state.pool, &budget_id, &user_id, &req.role).await?))
}

pub async fn delete(State(state): State<Arc<AppState>>, Extension(claims): Extension<crate::handler::auth::Claims>, Path((budget_id, user_id)): Path<(String, String)>) -> Result<(), AppError> {
    crate::manager::biz::authz::ensure_owner(&state.pool, &budget_id, &claims.sub).await?;
    MemberService::delete(&state.pool, &budget_id, &user_id).await?;
    Ok(())
}
