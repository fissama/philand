use crate::manager::models::transfer::{CreateTransferReq, TransferWithEntries};
use crate::manager::repository::transfers::TransferRepo;
use crate::manager::repository::budgets::BudgetRepo;
use crate::manager::models::role::Role;
use crate::utils::{database::database::DbPool, error::error::AppError};

pub struct TransferService;

impl TransferService {
    pub async fn create_transfer(
        pool: &DbPool,
        user_id: &str,
        req: CreateTransferReq,
    ) -> Result<TransferWithEntries, AppError> {
        if req.from_budget_id == req.to_budget_id {
            return Err(AppError::BadRequest("Cannot transfer to the same budget".to_string()));
        }

        if req.amount_minor <= 0 {
            return Err(AppError::BadRequest("Transfer amount must be positive".to_string()));
        }

        crate::manager::biz::authz::ensure_role(
            pool,
            &req.from_budget_id,
            user_id,
            Role::Contributor,
        ).await?;

        crate::manager::biz::authz::ensure_role(
            pool,
            &req.to_budget_id,
            user_id,
            Role::Contributor,
        ).await?;

        let from_budget = BudgetRepo::get(pool, &req.from_budget_id).await?;
        let to_budget = BudgetRepo::get(pool, &req.to_budget_id).await?;

        if from_budget.currency_code != to_budget.currency_code {
            return Err(AppError::BadRequest(
                format!("Currency mismatch: {} vs {}", from_budget.currency_code, to_budget.currency_code)
            ));
        }

        let transfer_id = uuid::Uuid::new_v4().to_string();
        let from_entry_id = uuid::Uuid::new_v4().to_string();
        let to_entry_id = uuid::Uuid::new_v4().to_string();

        let mut tx = pool.begin().await?;

        sqlx::query(
            "INSERT INTO budget_transfers 
             (id, from_budget_id, to_budget_id, amount_minor, currency_code, transfer_date, note, created_by) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
        )
        .bind(&transfer_id)
        .bind(&req.from_budget_id)
        .bind(&req.to_budget_id)
        .bind(req.amount_minor)
        .bind(&req.currency_code)
        .bind(req.transfer_date)
        .bind(&req.note)
        .bind(user_id)
        .execute(&mut *tx)
        .await?;

        let transfer_note = req.note.clone().unwrap_or_else(|| {
            format!("Transfer to {}", to_budget.name)
        });
        let receive_note = format!("Transfer from {}", from_budget.name);

        sqlx::query(
            "INSERT INTO entries 
             (id, budget_id, category_id, kind, amount_minor, currency_code, entry_date, description, created_by, transfer_id) 
             VALUES (?, ?, ?, 'expense', ?, ?, ?, ?, ?, ?)"
        )
        .bind(&from_entry_id)
        .bind(&req.from_budget_id)
        .bind(&req.from_category_id)
        .bind(req.amount_minor)
        .bind(&from_budget.currency_code)
        .bind(req.transfer_date)
        .bind(&transfer_note)
        .bind(user_id)
        .bind(&transfer_id)
        .execute(&mut *tx)
        .await?;

        sqlx::query(
            "INSERT INTO entries 
             (id, budget_id, category_id, kind, amount_minor, currency_code, entry_date, description, created_by, transfer_id) 
             VALUES (?, ?, ?, 'income', ?, ?, ?, ?, ?, ?)"
        )
        .bind(&to_entry_id)
        .bind(&req.to_budget_id)
        .bind(&req.to_category_id)
        .bind(req.amount_minor)
        .bind(&to_budget.currency_code)
        .bind(req.transfer_date)
        .bind(&receive_note)
        .bind(user_id)
        .bind(&transfer_id)
        .execute(&mut *tx)
        .await?;

        tx.commit().await?;

        let transfer = TransferRepo::get_by_id(pool, &transfer_id).await?;

        Ok(TransferWithEntries {
            transfer,
            from_entry_id,
            to_entry_id,
            from_budget_name: from_budget.name,
            to_budget_name: to_budget.name,
        })
    }
}
