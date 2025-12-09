use crate::manager::models::transfer::{BudgetTransfer, CreateTransferReq};
use crate::utils::{database::database::DbPool, error::error::AppError};

pub struct TransferRepo;

impl TransferRepo {
    pub async fn create(
        pool: &DbPool,
        transfer_id: &str,
        req: &CreateTransferReq,
        user_id: &str,
    ) -> Result<BudgetTransfer, AppError> {
        sqlx::query_as::<_, BudgetTransfer>(
            "INSERT INTO budget_transfers 
             (id, from_budget_id, to_budget_id, amount_minor, currency_code, transfer_date, note, created_by) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)
             RETURNING *"
        )
        .bind(transfer_id)
        .bind(&req.from_budget_id)
        .bind(&req.to_budget_id)
        .bind(req.amount_minor)
        .bind(&req.currency_code)
        .bind(req.transfer_date)
        .bind(&req.note)
        .bind(user_id)
        .fetch_one(pool)
        .await
        .map_err(|e| {
            tracing::error!("Failed to create transfer: {:?}", e);
            AppError::Internal
        })
    }

    pub async fn get_by_id(
        pool: &DbPool,
        transfer_id: &str,
    ) -> Result<BudgetTransfer, AppError> {
        sqlx::query_as::<_, BudgetTransfer>(
            "SELECT * FROM budget_transfers WHERE id = ?"
        )
        .bind(transfer_id)
        .fetch_optional(pool)
        .await?
        .ok_or(AppError::NotFound)
    }

    pub async fn list_by_budget(
        pool: &DbPool,
        budget_id: &str,
    ) -> Result<Vec<BudgetTransfer>, AppError> {
        sqlx::query_as::<_, BudgetTransfer>(
            "SELECT * FROM budget_transfers 
             WHERE from_budget_id = ? OR to_budget_id = ?
             ORDER BY transfer_date DESC, created_at DESC"
        )
        .bind(budget_id)
        .bind(budget_id)
        .fetch_all(pool)
        .await
        .map_err(|e| {
            tracing::error!("Failed to list transfers: {:?}", e);
            AppError::Internal
        })
    }
}
