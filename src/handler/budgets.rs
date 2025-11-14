use std::sync::Arc;
use axum::{extract::{Query, Path, State}, Json, Extension};
use serde::{Deserialize, Serialize};
use crate::manager::models::{budget::{Budget, BudgetWithRole, CreateBudgetReq}};
use crate::manager::biz::budgets::BudgetService;
use crate::utils::error::error::AppError;
use super::{AppState};

#[derive(Deserialize)]
pub struct BudgetFilter { 
    owner_id: Option<String>,
    query: Option<String>,
}

#[derive(Deserialize)]
pub struct UpdateBudgetReq {
    pub name: Option<String>,
    pub description: Option<String>,
    pub currency_code: Option<String>,
    pub archived: Option<bool>,
}

#[derive(Serialize)]
pub struct DeleteBudgetResp {
    pub message: String,
}

#[derive(Serialize)]
pub struct BudgetBalanceResp {
    pub income: i64,
    pub expense: i64,
    pub net: i64,
    pub currency_code: String,
}

pub async fn list(State(state): State<Arc<AppState>>, Extension(claims): Extension<crate::handler::auth::Claims>, Query(filter): Query<BudgetFilter>) -> Result<Json<Vec<BudgetWithRole>>, AppError> {
    // Return budgets with user roles for RBAC
    Ok(Json(BudgetService::list_with_roles_for_user(&state.pool, &claims.sub, filter.query).await?))
}

pub async fn get(State(state): State<Arc<AppState>>, Extension(claims): Extension<crate::handler::auth::Claims>, Path(id): Path<String>) -> Result<Json<Budget>, AppError> {
    // Ensure user has access to this budget
    crate::manager::biz::authz::ensure_role(&state.pool, &id, &claims.sub, crate::manager::models::role::Role::Viewer).await?;
    Ok(Json(BudgetService::get(&state.pool, &id).await?))
}

pub async fn create(State(state): State<Arc<AppState>>, Extension(claims): Extension<crate::handler::auth::Claims>, Json(mut req): Json<CreateBudgetReq>) -> Result<Json<Budget>, AppError> {
    req.owner_id = claims.sub.clone();
    Ok(Json(BudgetService::create(&state.pool, req).await?))
}

pub async fn update(State(state): State<Arc<AppState>>, Extension(claims): Extension<crate::handler::auth::Claims>, Path(id): Path<String>, Json(req): Json<UpdateBudgetReq>) -> Result<Json<Budget>, AppError> {
    // Check if user has manager+ permissions
    crate::manager::biz::authz::ensure_manager_or_owner(&state.pool, &id, &claims.sub).await?;
    Ok(Json(BudgetService::update(&state.pool, &id, req).await?))
}

pub async fn delete(State(state): State<Arc<AppState>>, Extension(claims): Extension<crate::handler::auth::Claims>, Path(id): Path<String>) -> Result<Json<DeleteBudgetResp>, AppError> {
    // Check if user is owner
    crate::manager::biz::authz::ensure_owner(&state.pool, &id, &claims.sub).await?;
    BudgetService::delete(&state.pool, &id).await?;
    Ok(Json(DeleteBudgetResp {
        message: "Budget deleted successfully".to_string(),
    }))
}

pub async fn get_balance(State(state): State<Arc<AppState>>, Extension(claims): Extension<crate::handler::auth::Claims>, Path(id): Path<String>) -> Result<Json<BudgetBalanceResp>, AppError> {
    // Ensure user has access to this budget
    crate::manager::biz::authz::ensure_role(&state.pool, &id, &claims.sub, crate::manager::models::role::Role::Viewer).await?;
    let budget = BudgetService::get(&state.pool, &id).await?;
    let balance = BudgetService::get_balance(&state.pool, &id).await?;
    Ok(Json(BudgetBalanceResp {
        income: balance.0,
        expense: balance.1,
        net: balance.0 - balance.1,
        currency_code: budget.currency_code,
    }))
}
