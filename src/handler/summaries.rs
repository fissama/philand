use std::sync::Arc;
use axum::{extract::{State, Path, Query}, Json, Extension};
use serde::Deserialize;
use crate::manager::biz::entries::EntryService;
use crate::utils::error::error::AppError;
use super::AppState;

#[derive(Deserialize)] pub struct SummaryFilter { pub from: chrono::NaiveDate, pub to: chrono::NaiveDate }
#[derive(serde::Serialize)] pub struct MonthlyRow { pub month_start: String, pub income_minor: i64, pub expense_minor: i64, pub net_minor: i64 }

pub async fn monthly(State(state): State<Arc<AppState>>, Extension(claims): Extension<crate::handler::auth::Claims>, Path(budget_id): Path<String>, Query(filter): Query<SummaryFilter>) -> Result<Json<Vec<MonthlyRow>>, AppError> {
    // Ensure user has at least viewer access to this budget
    crate::manager::biz::authz::ensure_role(&state.pool, &budget_id, &claims.sub, crate::manager::models::role::Role::Viewer).await?;
    let rows = EntryService::monthly_summary(&state.pool, &budget_id, filter.from, filter.to).await?;
    Ok(Json(rows.into_iter().map(|(m,i,e,n)| MonthlyRow{ month_start: m.to_string(), income_minor: i, expense_minor: e, net_minor:n }).collect()))
}
