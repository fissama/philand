use std::sync::Arc;
use axum::{extract::State, Json, Extension};
use serde::Deserialize;
use crate::manager::biz::transfers::TransferService;
use crate::manager::models::transfer::{CreateTransferReq, TransferWithEntries};
use crate::utils::error::error::AppError;
use super::AppState;

#[derive(Deserialize)]
pub struct CreateTransferHttpReq {
    pub from_budget_id: String,
    pub to_budget_id: String,
    pub amount_minor: i64,
    pub currency_code: String,
    pub transfer_date: chrono::NaiveDate,
    pub note: Option<String>,
    pub from_category_id: String,
    pub to_category_id: String,
}

pub async fn create_transfer(
    State(state): State<Arc<AppState>>,
    Extension(claims): Extension<crate::handler::auth::Claims>,
    Json(req): Json<CreateTransferHttpReq>,
) -> Result<Json<TransferWithEntries>, AppError> {
    let transfer_req = CreateTransferReq {
        from_budget_id: req.from_budget_id,
        to_budget_id: req.to_budget_id,
        amount_minor: req.amount_minor,
        currency_code: req.currency_code,
        transfer_date: req.transfer_date,
        note: req.note,
        from_category_id: req.from_category_id,
        to_category_id: req.to_category_id,
    };

    let result = TransferService::create_transfer(
        &state.pool,
        &claims.sub,
        transfer_req,
    ).await?;

    Ok(Json(result))
}
