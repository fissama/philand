use crate::manager::{models::role::{Role}};
use crate::utils::{database::database::DbPool, error::error::AppError};
use crate::manager::{repository::members::MemberRepo};

pub async fn ensure_role(pool: &DbPool, budget_id: &str, user_id: &str, required: Role) -> Result<Role, AppError> {
    let role = MemberRepo::get_role(pool, budget_id, user_id).await?
        .ok_or(AppError::Forbidden)?;
    if role.rank() <= required.rank() { Ok(role) } else { Err(AppError::Forbidden) }
}
pub async fn ensure_owner(pool: &DbPool, budget_id: &str, user_id: &str) -> Result<(), AppError> {
    let role = MemberRepo::get_role(pool, budget_id, user_id).await?
        .ok_or(AppError::Forbidden)?;
    if role == Role::Owner { Ok(()) } else { Err(AppError::Forbidden) }
}
